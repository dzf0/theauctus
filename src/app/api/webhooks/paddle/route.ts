/**
 * POST /api/webhooks/paddle
 *
 * Paddle webhook handler using the official Node SDK.
 * Uses paddle.webhooks.unmarshal() for signature verification.
 * Processes payment events and credits user accounts.
 *
 * Paddle is the Merchant of Record — they handle tax, compliance, and payments.
 *
 * Setup:
 *   1. Set PADDLE_API_KEY in .env (server-side, from Paddle → Developer tools → Authentication)
 *   2. Set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN in .env (client-side)
 *   3. Set PADDLE_NOTIFICATION_WEBHOOK_SECRET in .env (from Paddle → Notifications → your destination)
 *   4. Set NEXT_PUBLIC_PADDLE_ENV to "sandbox" or "production"
 *   5. Set PADDLE_PRICE_STARTER, PADDLE_PRICE_GROWTH, PADDLE_PRICE_PRO
 *   6. Create notification destination in Paddle Dashboard → Developer tools → Notifications
 *      - URL: https://your-domain.com/api/webhooks/paddle
 *      - Events: transaction.completed, transaction.updated
 */

import { NextRequest } from "next/server";
import { EventName, type EventEntity } from "@paddle/paddle-node-sdk";
import { getPaddleInstance } from "@/lib/paddle";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { auditLog } from "@/lib/api-middleware";
import { CREDIT_PACKS } from "@/lib/constants";

// ══════════════════════════════════════════════════════════════
// Price ID → pack lookup
// ══════════════════════════════════════════════════════════════

const PRICE_TO_PACK: Record<string, (typeof CREDIT_PACKS)[number]> = {};
for (const pack of CREDIT_PACKS) {
  if (pack.paddlePriceId) {
    PRICE_TO_PACK[pack.paddlePriceId] = pack;
  }
}

// Also map via env vars (fallback)
const ENV_PRICE_MAP: Record<string, string> = {
  starter: process.env.PADDLE_PRICE_STARTER || "",
  growth: process.env.PADDLE_PRICE_GROWTH || "",
  pro: process.env.PADDLE_PRICE_PRO || "",
};

for (const [packId, priceId] of Object.entries(ENV_PRICE_MAP)) {
  if (priceId && !PRICE_TO_PACK[priceId]) {
    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (pack) PRICE_TO_PACK[priceId] = pack;
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/webhooks/paddle
// ══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[PADDLE] PADDLE_NOTIFICATION_WEBHOOK_SECRET not configured");
    return Response.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  // ── Read raw body + signature (MUST be raw text for verification) ──
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature") ?? "";

  // Pre-validation: missing signature or body can't be verified
  if (!signature || !rawBody) {
    return Response.json(
      { error: "Missing signature or body" },
      { status: 400 }
    );
  }

  try {
    const paddle = getPaddleInstance();

    // unmarshal() verifies HMAC signature + returns typed event
    // Throws on invalid signature, expired timestamp, or malformed payload
    const eventData = await paddle.webhooks.unmarshal(
      rawBody,
      webhookSecret,
      signature
    );

    if (!eventData) {
      return Response.json({ error: "Invalid event" }, { status: 400 });
    }

    // Route to handler
    await processEvent(eventData);

    return Response.json({ received: true });
  } catch (e) {
    // Any non-2xx tells Paddle to retry — don't return 200 on failure
    console.error("[PADDLE] Webhook error:", e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

// ══════════════════════════════════════════════════════════════
// Event router
// ══════════════════════════════════════════════════════════════

async function processEvent(event: EventEntity) {
  console.log("[PADDLE] Event:", event.eventType, event.eventId);

  switch (event.eventType) {
    case EventName.TransactionCompleted:
      return handleTransactionCompleted(event);

    case EventName.TransactionUpdated:
      return handleTransactionUpdated(event);

    default:
      console.log("[PADDLE] Unhandled event:", event.eventType);
      return;
  }
}

// ══════════════════════════════════════════════════════════════
// Transaction completed — grant credits
// ══════════════════════════════════════════════════════════════

async function handleTransactionCompleted(event: EventEntity) {
  const supabase = createSupabaseAdminClient();
  const data = event.data as unknown as Record<string, unknown>;

  // Extract user metadata from checkout customData
  const customData = (data.customData ?? {}) as Record<string, string>;
  const userId = customData.user_id;
  const packId = customData.pack;

  // Also check passthrough (v1 compat)
  const passthrough = data.passthrough
    ? JSON.parse(data.passthrough as string)
    : {};
  const effectiveUserId = userId || passthrough.user_id;
  const effectivePackId = packId || passthrough.pack;

  if (!effectiveUserId) {
    console.error("[PADDLE] No user_id in transaction metadata");
    return;
  }

  const transactionId = String(data.transactionId ?? data.id ?? "");

  // ── IDEMPOTENCY: check if already processed ──
  const { data: existingCredit } = await supabase
    .from("credit_history")
    .select("id")
    .eq("user_id", effectiveUserId)
    .eq("reference_id", transactionId)
    .eq("type", "purchase")
    .limit(1)
    .maybeSingle();

  if (existingCredit) {
    console.log("[PADDLE] Already processed:", transactionId, "— skipping");
    return;
  }

  // ── Determine credit pack ──
  let pack = effectivePackId
    ? CREDIT_PACKS.find((p) => p.id === effectivePackId)
    : null;

  // Fallback: match by price ID from line items
  if (!pack && Array.isArray(data.items)) {
    for (const item of data.items as Array<Record<string, unknown>>) {
      const priceId = String(item.priceId ?? "");
      if (priceId && PRICE_TO_PACK[priceId]) {
        pack = PRICE_TO_PACK[priceId];
        break;
      }
    }
  }

  // Fallback: match by product ID
  if (!pack) {
    const productId = String(data.productId ?? "");
    if (productId) {
      const match = Object.entries(PRICE_TO_PACK).find(
        ([, p]) => p.paddlePriceId === productId
      );
      if (match) pack = match[1];
    }
  }

  if (!pack) {
    console.error("[PADDLE] Could not determine credit pack for:", transactionId);
    return;
  }

  const credits = pack.credits;

  // ── ATOMIC BALANCE UPDATE ──
  const { error: rpcError } = await supabase.rpc("increment_balance", {
    p_user_id: effectiveUserId,
    p_amount: credits,
  });

  if (rpcError) {
    // Fallback: manual upsert (still idempotent via history check)
    const { data: existing } = await supabase
      .from("credit_balances")
      .select("balance")
      .eq("user_id", effectiveUserId)
      .single();

    const newBalance = (existing?.balance ?? 0) + credits;
    await supabase.from("credit_balances").upsert(
      { user_id: effectiveUserId, balance: newBalance, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  }

  // ── Record credit history ──
  await supabase.from("credit_history").insert({
    user_id: effectiveUserId,
    amount: credits,
    type: "purchase",
    description: `Purchased ${credits} credits (${pack.name} pack — $${pack.price})`,
    reference_id: transactionId,
  });

  // ── Audit log ──
  await auditLog({
    userId: effectiveUserId,
    action: "paddle_transaction_completed",
    newData: { transactionId, pack: pack.id, credits, amount: pack.price },
  });

  // ── Send receipt email (non-blocking) ──
  try {
    const { data: userProfile } = await supabase.auth.admin.getUserById(effectiveUserId);
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", effectiveUserId)
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
        transactionId,
        date: new Date(),
      });
    }
  } catch (emailErr) {
    console.error("[PADDLE] Receipt email failed:", emailErr);
  }

  console.log("[PADDLE] Credited", credits, "credits to", effectiveUserId, "for", pack.id);
}

// ══════════════════════════════════════════════════════════════
// Transaction updated — handle refunds
// ══════════════════════════════════════════════════════════════

async function handleTransactionUpdated(event: EventEntity) {
  const supabase = createSupabaseAdminClient();
  const data = event.data as unknown as Record<string, unknown>;

  const transactionId = String(data.transactionId ?? data.id ?? "");
  const status = data.status as string;

  // Only process refunds
  if (status !== "refund") {
    console.log("[PADDLE] Transaction updated:", transactionId, "status:", status);
    return;
  }

  // ── Find original purchase ──
  const { data: originalPurchase } = await supabase
    .from("credit_history")
    .select("id, user_id, amount, description")
    .eq("reference_id", transactionId)
    .eq("type", "purchase")
    .limit(1)
    .maybeSingle();

  if (!originalPurchase) {
    console.error("[PADDLE] No original purchase for refund:", transactionId);
    return;
  }

  // ── Idempotency ──
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
    return;
  }

  const creditsToDeduct = Math.abs(originalPurchase.amount);

  // ── Atomic balance decrement ──
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
    await supabase.from("credit_balances").upsert(
      { user_id: originalPurchase.user_id, balance: newBalance, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  }

  // ── Record refund ──
  await supabase.from("credit_history").insert({
    user_id: originalPurchase.user_id,
    amount: -creditsToDeduct,
    type: "refund",
    description: `Refund: ${creditsToDeduct} credits (${originalPurchase.description})`,
    reference_id: `refund_${transactionId}`,
  });

  await auditLog({
    userId: originalPurchase.user_id,
    action: "paddle_refund_completed",
    newData: { transactionId, creditsDeducted: creditsToDeduct },
  });

  // ── Send refund email (non-blocking) ──
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
        transactionId,
        date: new Date(),
      });
    }
  } catch (emailErr) {
    console.error("[PADDLE] Refund email failed:", emailErr);
  }

  console.log("[PADDLE] Refunded", creditsToDeduct, "credits from", originalPurchase.user_id);
}
