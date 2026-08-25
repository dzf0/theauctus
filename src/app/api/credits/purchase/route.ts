import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { apiValidationError } from "@/lib/errors";
import { CREDIT_PACKS, CUSTOM_CREDIT_RATE, CUSTOM_CREDIT_MIN_DOLLARS, CUSTOM_CREDIT_MAX_DOLLARS } from "@/lib/constants";

// ══════════════════════════════════════════════════════════════
// Build pack lookup from single source of truth
// ══════════════════════════════════════════════════════════════

const PACK_MAP: Record<string, typeof CREDIT_PACKS[number]> = {};
for (const pack of CREDIT_PACKS) {
  PACK_MAP[pack.id] = pack;
}

// ══════════════════════════════════════════════════════════════
// POST /api/credits/purchase
//
// Accepts:
//   { pack: "starter" | "growth" | "pro" }              — preset packs
//   { pack: "custom", customAmount: number }              — custom $5-$500
//
// The server determines credits from the pack or calculates
// them at CUSTOM_CREDIT_RATE for custom amounts.
// ══════════════════════════════════════════════════════════════

function calculateCustomCredits(amountDollars: number): number {
  return Math.floor(amountDollars / CUSTOM_CREDIT_RATE);
}

export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const { pack, customAmount } = body;

  // Validate pack
  if (!pack) {
    return apiValidationError("pack is required");
  }

  // Resolve pack data
  let packData: { id: string; name: string; credits: number; price: number; stripePriceId?: string };

  if (pack === "custom") {
    // Custom amount
    const amount = parseFloat(customAmount);

    if (isNaN(amount) || amount < CUSTOM_CREDIT_MIN_DOLLARS) {
      return apiValidationError(`Minimum purchase is $${CUSTOM_CREDIT_MIN_DOLLARS}`);
    }
    if (amount > CUSTOM_CREDIT_MAX_DOLLARS) {
      return apiValidationError(`Maximum purchase is $${CUSTOM_CREDIT_MAX_DOLLARS}`);
    }

    // Round to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;
    const credits = calculateCustomCredits(roundedAmount);

    packData = {
      id: "custom",
      name: "Custom",
      credits,
      price: roundedAmount,
    };
  } else if (PACK_MAP[pack]) {
    packData = PACK_MAP[pack];
  } else {
    const validPacks = [...CREDIT_PACKS.map((p) => p.id), "custom"].join(", ");
    return apiValidationError(`Invalid pack. Must be one of: ${validPacks}`);
  }

  // In dev/demo mode without Stripe: add credits directly
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const isDemo = !stripeKey || stripeKey === "sk_test_demo";

  if (isDemo) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Stripe is not configured. Cannot process payment." },
        { status: 503 }
      );
    }

    const { createSupabaseServerClient } = await import("@/lib/supabase-server");
    const supabase = await createSupabaseServerClient();

    const { data: existing } = await supabase
      .from("credit_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    const currentBalance = existing?.balance ?? 0;
    const newBalance = currentBalance + packData.credits;

    if (existing) {
      await supabase
        .from("credit_balances")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("credit_balances")
        .insert({ user_id: user.id, balance: newBalance });
    }

    await supabase.from("credit_history").insert({
      user_id: user.id,
      amount: packData.credits,
      type: "purchase",
      description: `[DEV] Purchased ${packData.credits} credits (${packData.name} — $${packData.price})`,
    });

    return NextResponse.json({
      success: true,
      mode: "demo",
      credits: packData.credits,
      newBalance,
    });
  }

  // Production: create a Stripe Checkout Session
  const stripePriceId = pack === "custom" ? null : packData.stripePriceId;

  if (!stripePriceId) {
    return NextResponse.json(
      { error: "Stripe price not configured for this pack." },
      { status: 500 }
    );
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey!);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        pack: packData.id,
        credits: String(packData.credits),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.theauctus.in"}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.theauctus.in"}/dashboard/billing?canceled=true`,
    });

    return NextResponse.json({
      success: true,
      mode: "stripe",
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("[CREDITS] Failed to create Stripe session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}, {
  rateLimit: { limit: 10, windowMs: 60_000 },
  rateLimitKey: "credits:purchase",
  auditAction: "initiate_credit_purchase",
});
