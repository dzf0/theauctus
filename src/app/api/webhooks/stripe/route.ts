/**
 * POST /api/webhooks/stripe
 *
 * Stripe webhook handler with signature verification.
 * Processes payment events and credits user accounts.
 *
 * Setup:
 *   1. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env
 *   2. Set STRIPE_PRICE_STARTER, STRIPE_PRICE_GROWTH, STRIPE_PRICE_PRO
 *   3. Add this URL as a webhook endpoint in Stripe Dashboard
 *   4. Select events: checkout.session.completed
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { auditLog } from "@/lib/api-middleware";
import { CREDIT_PACKS } from "@/lib/constants";

// ══════════════════════════════════════════════════════════════
// Build price ID → pack lookup from single source of truth
// ══════════════════════════════════════════════════════════════

const PRICE_TO_PACK: Record<string, typeof CREDIT_PACKS[number]> = {};
for (const pack of CREDIT_PACKS) {
  if (pack.stripePriceId) {
    PRICE_TO_PACK[pack.stripePriceId] = pack;
  }
}

// Also map via env vars (allows overriding Stripe price IDs without code changes)
const ENV_PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || "",
  growth: process.env.STRIPE_PRICE_GROWTH || "",
  pro: process.env.STRIPE_PRICE_PRO || "",
};

// Build reverse map: env price ID → pack
for (const [packId, priceId] of Object.entries(ENV_PRICE_MAP)) {
  if (priceId) {
    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (pack) {
      PRICE_TO_PACK[priceId] = pack;
    }
  }
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return secret;
}

export async function POST(request: Request) {
  // ── Verify webhook secret is configured ─────────────────────
  let webhookSecret: string;
  try {
    webhookSecret = getWebhookSecret();
  } catch {
    console.error("[STRIPE] WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  // ── Verify Stripe signature ─────────────────────────────────
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripeInstance = getStripe();
  let event: Stripe.Event;
  try {
    event = stripeInstance.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[STRIPE] Signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Process event ───────────────────────────────────────────
  try {
    const supabase = createSupabaseAdminClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const packId = session.metadata?.pack;

        if (!userId) {
          console.error("[STRIPE] No user_id in session metadata");
          break;
        }

        // Look up pack from metadata first, then fall back to price ID lookup
        let pack = packId ? CREDIT_PACKS.find((p) => p.id === packId) : null;

        if (!pack) {
          // Fall back to price ID lookup
          const expandedSession = await stripeInstance.checkout.sessions.retrieve(
            session.id,
            { expand: ["line_items"] }
          );
          const priceId = expandedSession.line_items?.data[0]?.price?.id;
          pack = priceId ? PRICE_TO_PACK[priceId] : null;
        }

        if (!pack) {
          console.error("[STRIPE] Could not determine credit pack for session:", session.id);
          break;
        }

        const credits = pack.credits;

        // Add credits to history
        await supabase.from("credit_history").insert({
          user_id: userId,
          amount: credits,
          type: "purchase",
          description: `Purchased ${credits} credits (${pack.name} pack — $${pack.price})`,
          reference_id: session.id,
        });

        // Update balance (upsert)
        const { data: existing } = await supabase
          .from("credit_balances")
          .select("balance")
          .eq("user_id", userId)
          .single();

        const newBalance = (existing?.balance ?? 0) + credits;
        await supabase
          .from("credit_balances")
          .upsert(
            { user_id: userId, balance: newBalance, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );

        // Audit log
        await auditLog({
          userId,
          action: "stripe_checkout_completed",
          newData: { sessionId: session.id, pack: pack.id, credits, amount: pack.price },
        });

        break;
      }

      default:
        // Unhandled event type — log but don't fail
        console.log("[STRIPE] Unhandled event type:", event.type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[STRIPE] Event processing failed:", err);
    // Return 200 to prevent Stripe from retrying — we've logged the error
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}
