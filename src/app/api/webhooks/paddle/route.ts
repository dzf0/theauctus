/**
 * POST /api/webhooks/paddle
 *
 * Paddle webhook handler with signature verification.
 * Processes payment events and credits user accounts.
 *
 * Paddle is the Merchant of Record — they handle tax, compliance, and payments.
 * This webhook receives notifications when payments succeed.
 *
 * Setup:
 *   1. Set PADDLE_VENDOR_ID and PADDLE_CLIENT_TOKEN in .env
 *   2. Set PADDLE_PRICE_STARTER, PADDLE_PRICE_GROWTH, PADDLE_PRICE_PRO
 *   3. Set PADDLE_WEBHOOK_SECRET (from Paddle Dashboard → Webhooks)
 *   4. Add this URL as a webhook endpoint in Paddle Dashboard
 *   5. Select events: transaction.completed, transaction.updated
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { auditLog } from "@/lib/api-middleware";
import { CREDIT_PACKS } from "@/lib/constants";

// ══════════════════════════════════════════════════════════════
// Build price ID → pack lookup from single source of truth
// ══════════════════════════════════════════════════════════════

const PRICE_TO_PACK: Record<string, (typeof CREDIT_PACKS)[number]> = {};
for (const pack of CREDIT_PACKS) {
  if (pack.paddlePriceId) {
    PRICE_TO_PACK[pack.paddlePriceId] = pack;
  }
}

// Also map via env vars
const ENV_PRICE_MAP: Record<string, string> = {
  starter: process.env.PADDLE_PRICE_STARTER || "",
  growth: process.env.PADDLE_PRICE_GROWTH || "",
  pro: process.env.PADDLE_PRICE_PRO || "",
};

for (const [packId, priceId] of Object.entries(ENV_PRICE_MAP)) {
  if (priceId) {
    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (pack) {
      PRICE_TO_PACK[priceId] = pack;
    }
  }
}

// ══════════════════════════════════════════════════════════════
// Paddle signature verification (HMAC-SHA256)
// ══════════════════════════════════════════════════════════════

function verifyPaddleSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Paddle signs the raw body with HMAC-SHA256
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/webhooks/paddle
// ══════════════════════════════════════════════════════════════

export async function POST(request: Request) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[PADDLE] WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  // ── Verify signature ─────────────────────────────────────────
  const body = await request.text();
  const signature = request.headers.get("paddle-signature") || "";

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!verifyPaddleSignature(body, signature, webhookSecret)) {
    console.error("[PADDLE] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Parse event ──────────────────────────────────────────────
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.alert_name as string;

  // ── Process event ───────────────────────────────────────────
  try {
    const supabase = createSupabaseAdminClient();

    switch (eventType) {
      case "transaction.completed": {
        // Paddle v2: event contains passthrough with our metadata
        const passthrough = event.passthrough
          ? JSON.parse(event.passthrough as string)
          : {};

        const userId = passthrough.user_id;
        const packId = passthrough.pack;

        if (!userId) {
          console.error("[PADDLE] No user_id in passthrough");
          break;
        }

        const subscriptionId = event.subscription_id as string | undefined;
        const transactionId = (event.transaction_id || event.order_id) as string;

        // ── IDEMPOTENCY CHECK ──────────────────────────────
        const { data: existingCredit } = await supabase
          .from("credit_history")
          .select("id")
          .eq("user_id", userId)
          .eq("reference_id", String(transactionId))
          .eq("type", "purchase")
          .limit(1)
          .maybeSingle();

        if (existingCredit) {
          console.log(
            "[PADDLE] Already processed transaction:",
            transactionId,
            "— skipping"
          );
          break;
        }

        // Look up pack from metadata, then fall back to price ID lookup
        let pack = packId
          ? CREDIT_PACKS.find((p) => p.id === packId)
          : null;

        if (!pack) {
          // Try to match by Paddle price ID from the event
          const paddlePriceId = event.product_id as string;
          pack = paddlePriceId ? PRICE_TO_PACK[paddlePriceId] : null;
        }

        if (!pack) {
          console.error(
            "[PADDLE] Could not determine credit pack for transaction:",
            transactionId
          );
          break;
        }

        const credits = pack.credits;

        // ── ATOMIC BALANCE UPDATE ───────────────────────────
        const { error: rpcError } = await supabase.rpc("increment_balance", {
          p_user_id: userId,
          p_amount: credits,
        });

        if (rpcError) {
          // Fallback: admin upsert (still idempotent via history check)
          const { data: existing } = await supabase
            .from("credit_balances")
            .select("balance")
            .eq("user_id", userId)
            .single();

          const newBalance = (existing?.balance ?? 0) + credits;
          await supabase
            .from("credit_balances")
            .upsert(
              {
                user_id: userId,
                balance: newBalance,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
        }

        // Record credit history
        await supabase.from("credit_history").insert({
          user_id: userId,
          amount: credits,
          type: "purchase",
          description: `Purchased ${credits} credits (${pack.name} pack — $${pack.price})`,
          reference_id: String(transactionId),
        });

        // Audit log
        await auditLog({
          userId,
          action: "paddle_transaction_completed",
          newData: {
            transactionId,
            subscriptionId: subscriptionId ?? null,
            pack: pack.id,
            credits,
            amount: pack.price,
          },
        });

        // Send purchase receipt email (non-blocking)
        try {
          const { data: userProfile } = await supabase.auth.admin.getUserById(userId);
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .single();

          if (userProfile?.user?.email) {
            const { sendPurchaseReceipt } = await import("@/lib/email");
            await sendPurchaseReceipt({
              userName: profileData?.full_name || "",
              userEmail: userProfile.user.email,
              packName: pack.name,
              credits,
              amount: pack.price,
              provider: "paddle",
              transactionId: String(transactionId),
              date: new Date(),
            });
          }
        } catch (emailErr) {
          console.error("[PADDLE] Failed to send receipt email:", emailErr);
        }

        console.log(
          "[PADDLE] Credited",
          credits,
          "credits to user",
          userId,
          "for pack",
          pack.id
        );
        break;
      }

      case "transaction.updated": {
        // Handle refunds — Paddle fires this when status changes to refund
        const transactionId = event.transaction_id as string;
        const newStatus = event.status as string;
        const oldStatus = event.old_status as string;

        // Only process completed refunds (not pending)
        if (newStatus !== "refund") {
          console.log("[PADDLE] Transaction updated:", transactionId, "status:", newStatus);
          break;
        }

        // Find the original purchase in credit_history
        const { data: originalPurchase } = await supabase
          .from("credit_history")
          .select("id, user_id, amount, description")
          .eq("reference_id", String(transactionId))
          .eq("type", "purchase")
          .limit(1)
          .maybeSingle();

        if (!originalPurchase) {
          console.error("[PADDLE] No original purchase found for refund:", transactionId);
          break;
        }

        // Idempotency: check if refund was already processed
        const { data: existingRefund } = await supabase
          .from("credit_history")
          .select("id")
          .eq("user_id", originalPurchase.user_id)
          .eq("reference_id", `refund_${transactionId}`)
          .eq("type", "refund")
          .limit(1)
          .maybeSingle();

        if (existingRefund) {
          console.log("[PADDLE] Refund already processed:", transactionId, "— skipping");
          break;
        }

        const creditsToDeduct = Math.abs(originalPurchase.amount);

        // Atomic balance decrement (clamps to 0)
        const { error: rpcError } = await supabase.rpc("decrement_balance", {
          p_user_id: originalPurchase.user_id,
          p_amount: creditsToDeduct,
        });

        if (rpcError) {
          // Fallback: manual decrement with clamp
          const { data: bal } = await supabase
            .from("credit_balances")
            .select("balance")
            .eq("user_id", originalPurchase.user_id)
            .single();

          const newBalance = Math.max((bal?.balance ?? 0) - creditsToDeduct, 0);
          await supabase
            .from("credit_balances")
            .upsert(
              {
                user_id: originalPurchase.user_id,
                balance: newBalance,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
        }

        // Record refund in credit history
        await supabase.from("credit_history").insert({
          user_id: originalPurchase.user_id,
          amount: -creditsToDeduct,
          type: "refund",
          description: `Refund: ${creditsToDeduct} credits (${originalPurchase.description})`,
          reference_id: `refund_${transactionId}`,
        });

        // Audit log
        await auditLog({
          userId: originalPurchase.user_id,
          action: "paddle_refund_completed",
          newData: {
            transactionId,
            creditsDeducted: creditsToDeduct,
            originalPurchaseId: originalPurchase.id,
          },
        });

        // Send refund notification email (non-blocking)
        try {
          const { data: userProfile } = await supabase.auth.admin.getUserById(originalPurchase.user_id);
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", originalPurchase.user_id)
            .single();

          if (userProfile?.user?.email) {
            const { sendRefundNotification } = await import("@/lib/email");
            await sendRefundNotification({
              userName: profileData?.full_name || "",
              userEmail: userProfile.user.email,
              creditsDeducted: creditsToDeduct,
              originalDescription: originalPurchase.description,
              provider: "paddle",
              transactionId: String(transactionId),
              date: new Date(),
            });
          }
        } catch (emailErr) {
          console.error("[PADDLE] Failed to send refund email:", emailErr);
        }

        console.log(
          "[PADDLE] Refunded",
          creditsToDeduct,
          "credits from user",
          originalPurchase.user_id,
          "for transaction",
          transactionId
        );
        break;
      }

      default:
        console.log("[PADDLE] Unhandled event type:", eventType);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[PADDLE] Event processing failed:", err);
    return NextResponse.json({
      received: true,
      error: "Processing failed",
    });
  }
}
