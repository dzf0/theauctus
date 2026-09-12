/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay webhook handler with signature verification.
 * Processes payment events and credits user accounts.
 *
 * Razorpay is for Indian users — supports UPI, Indian cards, etc.
 *
 * Setup:
 *   1. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
 *   2. Set RAZORPAY_WEBHOOK_SECRET (from Razorpay Dashboard → Settings → Webhooks)
 *   3. Add this URL as a webhook endpoint in Razorpay Dashboard
 *   4. Select events: payment.captured, payment.authorized
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { auditLog } from "@/lib/api-middleware";
import { CREDIT_PACKS } from "@/lib/constants";

// ══════════════════════════════════════════════════════════════
// Razorpay signature verification (HMAC-SHA256)
// ══════════════════════════════════════════════════════════════

function verifyRazorpaySignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
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
// POST /api/webhooks/razorpay
// ══════════════════════════════════════════════════════════════

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[RAZORPAY] WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  // ── Verify signature ─────────────────────────────────────────
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!verifyRazorpaySignature(body, signature, webhookSecret)) {
    console.error("[RAZORPAY] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Parse event ──────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event as string;

  // ── Process event ───────────────────────────────────────────
  try {
    const supabase = createSupabaseAdminClient();

    switch (eventType) {
      case "payment.captured": {
        const payment = event.payload?.payment?.entity as Record<
          string,
          unknown
        > | undefined;

        if (!payment) {
          console.error("[RAZORPAY] No payment entity in event");
          break;
        }

        const orderId = payment.order_id as string;
        const paymentId = payment.id as string;
        const amount = payment.amount as number; // in paise/cents

        // Razorpay notes contain our metadata (set during order creation)
        const notes = (payment.notes || {}) as Record<string, string>;
        const userId = notes.user_id;
        const packId = notes.pack;

        if (!userId) {
          console.error("[RAZORPAY] No user_id in payment notes");
          break;
        }

        // ── IDEMPOTENCY CHECK ──────────────────────────────
        const { data: existingCredit } = await supabase
          .from("credit_history")
          .select("id")
          .eq("user_id", userId)
          .eq("reference_id", paymentId)
          .eq("type", "purchase")
          .limit(1)
          .maybeSingle();

        if (existingCredit) {
          console.log(
            "[RAZORPAY] Already processed payment:",
            paymentId,
            "— skipping"
          );
          break;
        }

        // Look up pack from notes
        const pack = packId
          ? CREDIT_PACKS.find((p) => p.id === packId)
          : null;

        if (!pack) {
          console.error(
            "[RAZORPAY] Could not determine credit pack for order:",
            orderId
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
          reference_id: paymentId,
        });

        // Audit log
        await auditLog({
          userId,
          action: "razorpay_payment_captured",
          newData: {
            orderId,
            paymentId,
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
              provider: "razorpay",
              transactionId: paymentId,
              date: new Date(),
            });
          }
        } catch (emailErr) {
          console.error("[RAZORPAY] Failed to send receipt email:", emailErr);
        }

        console.log(
          "[RAZORPAY] Credited",
          credits,
          "credits to user",
          userId,
          "for pack",
          pack.id
        );
        break;
      }

      case "payment.authorized": {
        // Payment authorized but not yet captured — just log it
        const payment = event.payload?.payment?.entity as Record<
          string,
          unknown
        > | undefined;
        console.log(
          "[RAZORPAY] Payment authorized:",
          payment?.id
        );
        break;
      }

      case "payment.refunded": {
        // Razorpay fires this when a refund is processed
        const payment = event.payload?.payment?.entity as Record<
          string,
          unknown
        > | undefined;

        if (!payment) {
          console.error("[RAZORPAY] No payment entity in refund event");
          break;
        }

        const paymentId = payment.id as string;
        const refundAmount = payment.amount_refunded as number; // in paise

        // Find the original purchase in credit_history
        const { data: originalPurchase } = await supabase
          .from("credit_history")
          .select("id, user_id, amount, description")
          .eq("reference_id", paymentId)
          .eq("type", "purchase")
          .limit(1)
          .maybeSingle();

        if (!originalPurchase) {
          console.error("[RAZORPAY] No original purchase found for refund:", paymentId);
          break;
        }

        // Idempotency: check if refund was already processed
        const { data: existingRefund } = await supabase
          .from("credit_history")
          .select("id")
          .eq("user_id", originalPurchase.user_id)
          .eq("reference_id", `refund_${paymentId}`)
          .eq("type", "refund")
          .limit(1)
          .maybeSingle();

        if (existingRefund) {
          console.log("[RAZORPAY] Refund already processed:", paymentId, "— skipping");
          break;
        }

        const creditsToDeduct = Math.abs(originalPurchase.amount);

        // Atomic balance decrement (clamps to 0)
        const { error: rpcError } = await supabase.rpc("decrement_balance", {
          p_user_id: originalPurchase.user_id,
          p_amount: creditsToDeduct,
        });

        if (rpcError) {
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
          reference_id: `refund_${paymentId}`,
        });

        // Audit log
        await auditLog({
          userId: originalPurchase.user_id,
          action: "razorpay_refund_completed",
          newData: {
            paymentId,
            refundAmount,
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
              provider: "razorpay",
              transactionId: paymentId,
              date: new Date(),
            });
          }
        } catch (emailErr) {
          console.error("[RAZORPAY] Failed to send refund email:", emailErr);
        }

        console.log(
          "[RAZORPAY] Refunded",
          creditsToDeduct,
          "credits from user",
          originalPurchase.user_id,
          "for payment",
          paymentId
        );
        break;
      }

      case "refund.created": {
        // Razorpay also fires this — log it but handle in payment.refunded
        const refund = event.payload?.refund?.entity as Record<
          string,
          unknown
        > | undefined;
        console.log("[RAZORPAY] Refund created:", refund?.id, "for payment:", refund?.payment_id);
        break;
      }

      case "payment.failed": {
        const payment = event.payload?.payment?.entity as Record<
          string,
          unknown
        > | undefined;
        console.error("[RAZORPAY] Payment failed:", payment?.id);
        break;
      }

      default:
        console.log("[RAZORPAY] Unhandled event type:", eventType);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[RAZORPAY] Event processing failed:", err);
    return NextResponse.json({
      received: true,
      error: "Processing failed",
    });
  }
}
