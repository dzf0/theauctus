"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { Spinner } from "@/components/ui/Loading";
import { CREDIT_PACKS, CREDIT_COSTS, CUSTOM_CREDIT_RATE, CUSTOM_CREDIT_MIN_DOLLARS, CUSTOM_CREDIT_MAX_DOLLARS } from "@/lib/constants";

// ── SVG Icons ────────────────────────────────────────────────────
const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent-copper)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const BoltIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const CrownIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.996.244-1.716.876-1.716 1.848v12.384c0 .972.72 1.604 1.716 1.848m7.5-10.312a7.454 7.454 0 01.982 3.172M15 4.236c.996.244 1.716.876 1.716 1.848v12.384c0 .972-.72 1.604-1.716 1.848M9.75 4.236c-.996.244-1.716.876-1.716 1.848v12.384c0 .972.72 1.604 1.716 1.848" />
  </svg>
);

// Map pack IDs to icons
const packIcons: Record<string, React.ReactNode> = {
  starter: <BoltIcon />,
  growth: <SparklesIcon />,
  pro: <CrownIcon />,
};

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [customError, setCustomError] = useState("");

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth/signin");
        return;
      }

      fetch("/api/user/stats")
        .then((r) => r.json())
        .then((data) => {
          setCurrentCredits(data.credits ?? 0);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [router]);

  const handlePurchasePack = async (pack: { id: string; name: string }) => {
    setPurchasing(pack.id);
    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: pack.name.toLowerCase() }),
      });

      const data = await res.json();

      if (data.mode === "stripe" && data.url) {
        window.location.href = data.url;
        return;
      }

      // Demo mode or success — go to onboarding
      router.push("/onboarding");
    } catch {
      router.push("/onboarding");
    } finally {
      setPurchasing(null);
    }
  };

  const handleCustomPurchase = async () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < CUSTOM_CREDIT_MIN_DOLLARS) {
      setCustomError(`Minimum purchase is $${CUSTOM_CREDIT_MIN_DOLLARS}`);
      return;
    }
    if (amount > CUSTOM_CREDIT_MAX_DOLLARS) {
      setCustomError(`Maximum purchase is $${CUSTOM_CREDIT_MAX_DOLLARS}`);
      return;
    }
    setCustomError("");
    setPurchasing("custom");
    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: "custom", customAmount: amount }),
      });
      const data = await res.json();
      if (data.mode === "stripe" && data.url) {
        window.location.href = data.url;
        return;
      }
      router.push("/onboarding");
    } catch {
      router.push("/onboarding");
    } finally {
      setPurchasing(null);
    }
  };

  const customCredits = customAmount ? Math.floor(parseFloat(customAmount || "0") / CUSTOM_CREDIT_RATE) : 0;

  const handleSkip = () => {
    router.push("/onboarding");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: "var(--muted)" }}>
        <Spinner size={20} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(201,168,124,0.06) 0%, transparent 60%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(124,158,201,0.04) 0%, transparent 60%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <span className="font-headline text-2xl" style={{ color: "var(--foreground)" }}>
              The<span className="accent-text">Auctus</span>
            </span>
          </Link>
          <h1 className="font-headline text-4xl sm:text-5xl mb-4" style={{ color: "var(--foreground)" }}>
            Power your content engine
          </h1>
          <p className="text-[14px] max-w-md mx-auto" style={{ color: "var(--muted)" }}>
            Credits power AI content generation. Each action costs a few credits — buy what you need, when you need it.
          </p>
          {currentCredits > 0 && (
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--success)" }} />
              <span className="text-[12px]" style={{ color: "var(--muted)" }}>
                You have <span className="font-medium" style={{ color: "var(--foreground)" }}>{currentCredits} free credits</span> to start
              </span>
            </div>
          )}
        </div>

        {/* Credit costs reference */}
        <div className="liquid-card p-6 mb-12 max-w-2xl mx-auto">
          <h3 className="font-headline text-lg mb-4" style={{ color: "var(--foreground)" }}>How credits work</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {CREDIT_COSTS.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < CREDIT_COSTS.length - 1 ? "1px solid var(--lg-border)" : "none" }}>
                <span className="text-[13px]" style={{ color: "var(--muted)" }}>{item.action}</span>
                <span className="text-[12px] font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--lg-bg-strong)", color: "var(--accent-copper)", border: "1px solid var(--lg-border)" }}>
                  {item.credits} credits
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Packs */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {CREDIT_PACKS.map((pack, i) => (
            <div
              key={pack.id}
              className={`liquid-card p-8 relative ${pack.popular ? "glow-breathe" : ""} animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {pack.popular && (
                <span className="liquid-badge absolute top-6 right-6 z-10">Best Value</span>
              )}

              <div className="text-[var(--accent-copper)] mb-4">{packIcons[pack.id]}</div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-3 relative z-10">
                {pack.name}
              </p>
              <div className="flex items-baseline gap-1 mb-1 relative z-10">
                <span className="font-headline text-5xl" style={{ color: "var(--foreground)" }}>${pack.price}</span>
              </div>
              <p className="text-[12px] mb-1 relative z-10" style={{ color: "var(--muted)" }}>
                {pack.credits} credits
              </p>
              <p className="text-[11px] mb-6 relative z-10" style={{ color: "var(--muted)" }}>
                {pack.pricePerCredit} per credit
              </p>
              <p className="text-[12px] text-[var(--muted)] mb-6 relative z-10">
                {pack.description}
              </p>

              <ul className="space-y-3 mb-8 relative z-10">
                {pack.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--cool-grey)" }}>
                    <CheckIcon />{f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchasePack(pack)}
                disabled={purchasing !== null}
                className={`block w-full text-center py-3 relative z-10 transition-opacity disabled:opacity-50 ${pack.popular ? "liquid-btn-primary" : "liquid-btn"}`}
              >
                {purchasing === pack.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size={14} /> Processing...
                  </span>
                ) : (
                  `Buy ${pack.credits} Credits`
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Custom amount */}
        <div className="liquid-card p-8 mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="text-[var(--accent-copper)] mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-3">Custom</p>
          <p className="text-[13px] text-[var(--muted)] mb-6">
            Enter any amount from ${CUSTOM_CREDIT_MIN_DOLLARS} to ${CUSTOM_CREDIT_MAX_DOLLARS}.
            <br />Credits at ${CUSTOM_CREDIT_RATE.toFixed(2)}/credit.
          </p>

          <div className="relative max-w-xs mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium" style={{ color: "var(--muted)" }}>$</span>
            <input
              type="number"
              min={CUSTOM_CREDIT_MIN_DOLLARS}
              max={CUSTOM_CREDIT_MAX_DOLLARS}
              step="1"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setCustomError(""); }}
              placeholder={`${CUSTOM_CREDIT_MIN_DOLLARS}`}
              className="w-full pl-8 pr-4 py-3 liquid-input text-[14px]"
            />
          </div>

          {customCredits > 0 && (
            <p className="text-[13px] mb-4" style={{ color: "var(--foreground)" }}>
              You get <span className="accent-text font-medium">{customCredits} credits</span>
            </p>
          )}

          {customError && (
            <p className="text-[12px] mb-3" style={{ color: "var(--danger)" }}>{customError}</p>
          )}

          <button
            onClick={handleCustomPurchase}
            disabled={purchasing !== null || !customAmount || parseFloat(customAmount) < CUSTOM_CREDIT_MIN_DOLLARS}
            className="block w-full text-center py-3 liquid-btn transition-opacity disabled:opacity-50"
          >
            {purchasing === "custom" ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size={14} /> Processing...
              </span>
            ) : (
              "Buy Custom Amount"
            )}
          </button>
        </div>

        {/* Skip / Already have credits */}
        <div className="text-center space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[13px] accent-text hover:opacity-80 transition-opacity"
          >
            I already have credits → Go to Dashboard
          </button>
          <div>
            <button
              onClick={handleSkip}
              className="text-[12px] hover:opacity-80 transition-opacity"
              style={{ color: "var(--muted)" }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
