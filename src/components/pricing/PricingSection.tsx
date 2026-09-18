/**
 * PricingSection — 3-tier credit pack pricing with Paddle Checkout overlay
 *
 * Credits are one-time purchases — they never expire.
 * Users buy credits and use them whenever they want.
 *
 * Security:
 * - Paddle.js initialized client-side with NEXT_PUBLIC_PADDLE_CLIENT_TOKEN (safe to expose)
 * - No server-side API keys in this file
 * - Email fetched from /api/pricing/preview (requires auth) — never stored in localStorage
 * - Country passed from server component (can't be spoofed)
 * - Price IDs come from env vars via CREDIT_PACKS
 * - Checkout.open() uses displayMode: 'overlay' and variant: 'one-page'
 * - Redirect to /welcome on success
 */

"use client";

import {
  type Environments,
  initializePaddle,
  type Paddle,
} from "@paddle/paddle-js";
import { useEffect, useState } from "react";
import { useUser } from "@/components/user-provider";
import { usePaddlePrices } from "@/hooks/usePaddlePrices";
import { CREDIT_PACKS } from "@/lib/constants";
import { Spinner } from "@/components/ui/Loading";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface PricingPreviewResponse {
  email: string | null;
  country: string | null;
}

// ══════════════════════════════════════════════════════════════
// SVG ICONS
// ══════════════════════════════════════════════════════════════

const CheckIcon = () => (
  <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent-copper)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

// ══════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════

interface Props {
  country: string | null;
}

export function PricingSection({ country }: Props) {
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const { prices, loading: pricesLoading, error: priceError } = usePaddlePrices(paddle, country);
  const user = useUser();

  // ── Initialize Paddle.js ────────────────────────────────────
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const env = process.env.NEXT_PUBLIC_PADDLE_ENV;

    if (!token || !env) {
      console.error("[PRICING] Paddle env vars not set. Required: NEXT_PUBLIC_PADDLE_CLIENT_TOKEN, NEXT_PUBLIC_PADDLE_ENV");
      return;
    }

    initializePaddle({
      token,
      environment: env as Environments,
    }).then((p) => {
      if (p) setPaddle(p);
    });
  }, []);

  // ── Fetch user email for checkout prefill ────────────────────
  useEffect(() => {
    if (!user) return;

    fetch("/api/pricing/preview")
      .then((r) => r.ok ? r.json() : null)
      .then((data: PricingPreviewResponse | null) => {
        if (data?.email) setUserEmail(data.email);
      })
      .catch(() => {
        // Non-critical — checkout will just ask for email
      });
  }, [user]);

  // ── Handle buy click ────────────────────────────────────────
  function handleBuy(packId: string) {
    if (!paddle) {
      console.error("[PRICING] Paddle not initialized");
      return;
    }

    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack?.paddlePriceId) {
      console.error(`[PRICING] No price ID for pack: ${packId}`);
      return;
    }

    setPurchasing(packId);

    const checkoutConfig: Parameters<Paddle["Checkout"]["open"]>[0] = {
      items: [{ priceId: pack.paddlePriceId, quantity: 1 }],
      settings: {
        displayMode: "overlay",
        variant: "one-page" as const,
        theme: "dark",
        successUrl: `${window.location.origin}/welcome`,
      },
    };

    // Prefill email if user is signed in
    if (userEmail) {
      checkoutConfig.customer = { email: userEmail };
    }

    paddle.Checkout.open(checkoutConfig);

    // Reset after a short delay (checkout overlay takes over)
    setTimeout(() => setPurchasing(null), 2000);
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-headline text-3xl sm:text-4xl mb-3" style={{ color: "var(--foreground)" }}>
          Buy credits
        </h1>
        <p className="text-[14px] max-w-md mx-auto" style={{ color: "var(--muted)" }}>
          Credits power AI content generation. Buy once, use forever — they never expire.
        </p>
      </div>

      {/* Price error */}
      {priceError && (
        <div className="text-center p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-[13px]" style={{ color: "var(--danger)" }}>{priceError}</p>
        </div>
      )}

      {/* Tier cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {CREDIT_PACKS.map((pack, i) => {
          const formatted = prices[pack.paddlePriceId ?? ""];

          return (
            <div
              key={pack.id}
              className={`liquid-card p-8 relative ${pack.popular ? "glow-breathe" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {pack.popular && (
                <span className="liquid-badge absolute top-6 right-6 z-10">Best Value</span>
              )}

              {/* Pack name */}
              <p className="text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: "var(--muted)" }}>
                {pack.name}
              </p>

              {/* Price */}
              <div className="mb-2">
                <span className="font-headline text-4xl" style={{ color: "var(--foreground)" }}>
                  {pricesLoading || !formatted ? "..." : formatted}
                </span>
              </div>

              {/* Credits + per-credit cost */}
              <p className="text-[13px] mb-1" style={{ color: "var(--muted)" }}>
                {pack.credits} credits — {pack.pricePerCredit} each
              </p>
              <p className="text-[12px] mb-6" style={{ color: "var(--muted)" }}>
                {pack.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {pack.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--cool-grey)" }}>
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Buy button */}
              <button
                onClick={() => handleBuy(pack.id)}
                disabled={!paddle || pricesLoading || purchasing !== null}
                className={`block w-full text-center py-3 transition-opacity disabled:opacity-50 ${
                  pack.popular ? "liquid-btn-primary" : "liquid-btn"
                }`}
              >
                {purchasing === pack.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size={14} /> Opening checkout...
                  </span>
                ) : !paddle || pricesLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size={14} /> Loading...
                  </span>
                ) : (
                  `Buy ${pack.credits} Credits`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-[12px]" style={{ color: "var(--muted)" }}>
        Credits never expire. Buy once, use whenever you need them. Prices include applicable tax.
      </p>
    </div>
  );
}
