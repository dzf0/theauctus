/**
 * PricingSection — 3-tier pricing with Paddle Checkout overlay
 *
 * Security:
 * - Paddle.js is initialized client-side with NEXT_PUBLIC_PADDLE_CLIENT_TOKEN (safe to expose)
 * - No server-side API keys in this file
 * - Email is fetched from /api/pricing/preview (requires auth) — never stored in localStorage
 * - Country is passed from server component (can't be spoofed)
 * - Price IDs come from env vars via constants.ts
 * - Checkout.open() uses displayMode: 'overlay' and variant: 'one-page' as specified
 * - Redirect to /welcome on success (set in checkout settings or event callback)
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
import { PRICING_TIERS, type Tier } from "@/lib/constants";
import { Spinner } from "@/components/ui/Loading";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface PricingPreviewResponse {
  email: string | null;
  country: string | null;
}

// ══════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════

interface Props {
  country: string | null;
}

export function PricingSection({ country }: Props) {
  const [frequency, setFrequency] = useState<"month" | "year">("month");
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);

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

  // ── Handle subscribe click ──────────────────────────────────
  function handleSubscribe(tier: Tier) {
    if (!paddle) {
      console.error("[PRICING] Paddle not initialized");
      return;
    }

    const priceId = tier.priceId[frequency];
    if (!priceId) {
      console.error(`[PRICING] No price ID for ${tier.name}/${frequency}`);
      return;
    }

    setSubscribing(tier.name);

    // Build checkout config
    const checkoutConfig: Parameters<Paddle["Checkout"]["open"]>[0] = {
      items: [{ priceId, quantity: 1 }],
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

    // Reset subscribing state after a short delay
    // (checkout overlay takes over the UI)
    setTimeout(() => setSubscribing(null), 2000);
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-headline text-3xl sm:text-4xl mb-3" style={{ color: "var(--foreground)" }}>
          Choose your plan
        </h1>
        <p className="text-[14px] max-w-md mx-auto" style={{ color: "var(--muted)" }}>
          AI-powered content generation for every creator. All plans include a 7-day free trial.
        </p>
      </div>

      {/* Frequency toggle */}
      <div className="flex justify-center">
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}
        >
          <button
            onClick={() => setFrequency("month")}
            className="px-4 py-2 text-[13px] rounded-md transition-all"
            style={{
              background: frequency === "month" ? "var(--accent-copper)" : "transparent",
              color: frequency === "month" ? "#0a0a0f" : "var(--muted)",
              fontWeight: frequency === "month" ? 600 : 400,
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setFrequency("year")}
            className="px-4 py-2 text-[13px] rounded-md transition-all"
            style={{
              background: frequency === "year" ? "var(--accent-copper)" : "transparent",
              color: frequency === "year" ? "#0a0a0f" : "var(--muted)",
              fontWeight: frequency === "year" ? 600 : 400,
            }}
          >
            Yearly
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{
              background: frequency === "year" ? "rgba(0,0,0,0.15)" : "rgba(201,168,124,0.15)",
              color: frequency === "year" ? "#0a0a0f" : "var(--accent-copper)",
            }}>
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Price error */}
      {priceError && (
        <div className="text-center p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-[13px]" style={{ color: "var(--danger)" }}>{priceError}</p>
        </div>
      )}

      {/* Tier cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PRICING_TIERS.map((tier, i) => {
          const priceId = tier.priceId[frequency];
          const formatted = prices[priceId];
          const isPopular = tier.name === "Growth";

          return (
            <div
              key={tier.name}
              className={`liquid-card p-8 relative ${isPopular ? "glow-breathe" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {isPopular && (
                <span className="liquid-badge absolute top-6 right-6 z-10">Most Popular</span>
              )}

              {/* Tier name */}
              <p className="text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: "var(--muted)" }}>
                {tier.name}
              </p>

              {/* Price */}
              <div className="mb-2">
                <span className="font-headline text-4xl" style={{ color: "var(--foreground)" }}>
                  {pricesLoading || !formatted ? "..." : formatted}
                </span>
                {!pricesLoading && formatted && (
                  <span className="text-[13px] ml-1" style={{ color: "var(--muted)" }}>
                    /{frequency === "month" ? "mo" : "yr"}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[13px] mb-6" style={{ color: "var(--muted)" }}>
                {tier.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--cool-grey)" }}>
                    <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent-copper)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Subscribe button */}
              <button
                onClick={() => handleSubscribe(tier)}
                disabled={!paddle || pricesLoading || subscribing !== null}
                className={`block w-full text-center py-3 transition-opacity disabled:opacity-50 ${
                  isPopular ? "liquid-btn-primary" : "liquid-btn"
                }`}
              >
                {subscribing === tier.name ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size={14} /> Opening checkout...
                  </span>
                ) : !paddle || pricesLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size={14} /> Loading...
                  </span>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-[12px]" style={{ color: "var(--muted)" }}>
        All plans include a 7-day free trial. Cancel anytime. Prices shown include applicable tax.
      </p>
    </div>
  );
}
