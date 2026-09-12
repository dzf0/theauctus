import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { apiValidationError } from "@/lib/errors";
import {
  CREDIT_PACKS,
  CUSTOM_CREDIT_RATE,
  CUSTOM_CREDIT_MIN_DOLLARS,
  CUSTOM_CREDIT_MAX_DOLLARS,
  DEFAULT_FEATURE_FLAGS,
} from "@/lib/constants";

// ══════════════════════════════════════════════════════════════
// Build pack lookup from single source of truth
// ══════════════════════════════════════════════════════════════

const PACK_MAP: Record<string, (typeof CREDIT_PACKS)[number]> = {};
for (const pack of CREDIT_PACKS) {
  PACK_MAP[pack.id] = pack;
}

// ══════════════════════════════════════════════════════════════
// Determine which payment provider to use
// ══════════════════════════════════════════════════════════════

type PaymentProvider = "paddle" | "razorpay" | "demo";

function getProvider(): PaymentProvider {
  // Paddle is preferred for international payments
  if (process.env.PADDLE_CLIENT_TOKEN && DEFAULT_FEATURE_FLAGS.enablePaddle) {
    return "paddle";
  }
  // Razorpay for Indian payments
  if (process.env.RAZORPAY_KEY_ID && DEFAULT_FEATURE_FLAGS.enableRazorpay) {
    return "razorpay";
  }
  // Demo mode (dev only)
  return "demo";
}

// ══════════════════════════════════════════════════════════════
// POST /api/credits/purchase
//
// Accepts:
//   { pack: "starter" | "growth" | "pro" }              — preset packs
//   { pack: "custom", customAmount: number }              — custom $5-$500
//   { provider?: "paddle" | "razorpay" }                  — override provider
//
// Returns:
//   { mode: "paddle", priceId, userMetadata }             — client opens Paddle overlay
//   { mode: "razorpay", orderId, amount, ... }            — client opens Razorpay popup
//   { mode: "demo", credits, newBalance }                 — dev mode, credits added directly
// ══════════════════════════════════════════════════════════════

function calculateCustomCredits(amountDollars: number): number {
  return Math.floor(amountDollars / CUSTOM_CREDIT_RATE);
}

export const POST = withAuth(
  async (request, { user }) => {
    const body = await request.json();
    const { pack, customAmount, provider: requestedProvider } = body;

    // Validate pack
    if (!pack) {
      return apiValidationError("pack is required");
    }

    // Resolve pack data
    let packData: {
      id: string;
      name: string;
      credits: number;
      price: number;
      paddlePriceId?: string;
    };

    if (pack === "custom") {
      const amount = parseFloat(customAmount);

      if (isNaN(amount) || amount < CUSTOM_CREDIT_MIN_DOLLARS) {
        return apiValidationError(
          `Minimum purchase is $${CUSTOM_CREDIT_MIN_DOLLARS}`
        );
      }
      if (amount > CUSTOM_CREDIT_MAX_DOLLARS) {
        return apiValidationError(
          `Maximum purchase is $${CUSTOM_CREDIT_MAX_DOLLARS}`
        );
      }

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
      const validPacks = [...CREDIT_PACKS.map((p) => p.id), "custom"].join(
        ", "
      );
      return apiValidationError(
        `Invalid pack. Must be one of: ${validPacks}`
      );
    }

    // Determine provider (client can override, e.g. Indian user picks Razorpay)
    const provider =
      requestedProvider && ["paddle", "razorpay"].includes(requestedProvider)
        ? requestedProvider
        : getProvider();

    // ── DEMO MODE ──────────────────────────────────────────────
    if (provider === "demo") {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            error:
              "No payment provider configured. Contact support.",
          },
          { status: 503 }
        );
      }

      const { createSupabaseAdminClient } = await import(
        "@/lib/supabase-admin"
      );
      const admin = createSupabaseAdminClient();

      const { data: existing } = await admin
        .from("credit_balances")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      const currentBalance = existing?.balance ?? 0;
      const newBalance = currentBalance + packData.credits;

      await admin.from("credit_balances").upsert(
        {
          user_id: user.id,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      await admin.from("credit_history").insert({
        user_id: user.id,
        amount: packData.credits,
        type: "purchase",
        description: `[DEV] Purchased ${packData.credits} credits (${packData.name} — $${packData.price})`,
      });

      // Mark onboarding as complete so middleware stops redirecting
      await admin.from("profiles").update({
        onboarded: true,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);

      return NextResponse.json({
        success: true,
        mode: "demo",
        credits: packData.credits,
        newBalance,
      });
    }

    // ── PADDLE MODE ────────────────────────────────────────────
    if (provider === "paddle") {
      const paddlePriceId =
        pack === "custom" ? null : packData.paddlePriceId;

      // Preset packs must have a Paddle price ID configured
      if (pack !== "custom" && !paddlePriceId) {
        return NextResponse.json(
          {
            error:
              "Paddle price not configured for this pack. Set PADDLE_PRICE_STARTER/GROWTH/PRO env vars.",
          },
          { status: 500 }
        );
      }

      // Return info for client-side Paddle overlay checkout
      // For custom amounts, Paddle uses a "passthrough" to pass custom data
      return NextResponse.json({
        success: true,
        mode: "paddle",
        // Preset pack: use the configured price ID
        priceId: paddlePriceId,
        // Custom amount: Paddle uses a known price + passthrough for the real amount
        customAmount: pack === "custom" ? packData.price : null,
        // Metadata passed through Paddle's passthrough field
        userMetadata: {
          user_id: user.id,
          pack: packData.id,
          credits: String(packData.credits),
          custom_amount: pack === "custom" ? String(packData.price) : null,
        },
      });
    }

    // ── RAZORPAY MODE ──────────────────────────────────────────
    if (provider === "razorpay") {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        return NextResponse.json(
          { error: "Razorpay is not configured." },
          { status: 500 }
        );
      }

      try {
        // Dynamically import Razorpay (server-side only)
        const Razorpay = (await import("razorpay")).default;
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        // Create an order (amount in paise/cents — Razorpay uses smallest unit)
        const amountInPaise = Math.round(packData.price * 100);

        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "USD",
          receipt: `credit_${packData.id}_${user.id.slice(0, 8)}_${Date.now()}`,
          notes: {
            user_id: user.id,
            pack: packData.id,
            credits: String(packData.credits),
          },
        });

        return NextResponse.json({
          success: true,
          mode: "razorpay",
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          razorpayKeyId: keyId,
          packName: packData.name,
          credits: packData.credits,
        });
      } catch (error) {
        console.error("[CREDITS] Failed to create Razorpay order:", error);
        return NextResponse.json(
          { error: "Failed to create payment order." },
          { status: 500 }
        );
      }
    }

    return apiValidationError("Invalid payment provider");
  },
  {
    rateLimit: { limit: 10, windowMs: 60_000 },
    rateLimitKey: "credits:purchase",
    auditAction: "initiate_credit_purchase",
  }
);
