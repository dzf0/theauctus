"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Loading";
import { CREDIT_PACKS, CREDIT_COSTS, CUSTOM_CREDIT_RATE, CUSTOM_CREDIT_MIN_DOLLARS, CUSTOM_CREDIT_MAX_DOLLARS } from "@/lib/constants";

interface CreditHistoryEntry {
  id: string;
  amount: number;
  type: "purchase" | "usage" | "refund" | "bonus";
  description: string;
  created_at: string;
}

// ── SVG Credit Usage Chart ──────────────────────────────────────
function CreditUsageChart({ history }: { history: CreditHistoryEntry[] }) {
  if (history.length < 2) {
    return (
      <div className="liquid-card p-6">
        <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Usage Over Time</h3>
        <p className="text-[13px] text-center py-8" style={{ color: "var(--muted)" }}>
          Not enough data yet. Charts appear after 2+ transactions.
        </p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, { purchased: number; used: number }> = {};
  const sorted = [...history].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  for (const entry of sorted) {
    const date = new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!grouped[date]) grouped[date] = { purchased: 0, used: 0 };
    if (entry.amount > 0) {
      grouped[date].purchased += entry.amount;
    } else {
      grouped[date].used += Math.abs(entry.amount);
    }
  }

  const days = Object.entries(grouped);
  const maxVal = Math.max(...days.map(([, d]) => Math.max(d.purchased, d.used)), 1);

  const chartW = 600;
  const chartH = 160;
  const barW = Math.min(40, Math.max(16, (chartW - 40) / days.length - 8));
  const gap = (chartW - 40 - barW * days.length) / Math.max(days.length - 1, 1);
  const baseline = chartH - 24;
  const barMaxH = baseline - 8;

  return (
    <div className="liquid-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>Usage Over Time</h3>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--success)" }} />
            <span style={{ color: "var(--muted)" }}>Purchased</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--danger)" }} />
            <span style={{ color: "var(--muted)" }}>Used</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartW} ${chartH + 20}`}
          className="w-full"
          style={{ minWidth: days.length > 10 ? 400 : undefined }}
        >
          {/* Baseline */}
          <line x1="20" y1={baseline} x2={chartW - 20} y2={baseline} stroke="var(--lg-border)" strokeWidth="1" />

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <line
              key={pct}
              x1="20"
              y1={baseline - barMaxH * pct}
              x2={chartW - 20}
              y2={baseline - barMaxH * pct}
              stroke="var(--lg-border)"
              strokeWidth="0.5"
              strokeDasharray="4 4"
              opacity="0.5"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 0.5, 1].map((pct) => (
            <text
              key={pct}
              x="16"
              y={baseline - barMaxH * pct + 3}
              textAnchor="end"
              fontSize="9"
              fill="var(--muted)"
            >
              {Math.round(maxVal * pct)}
            </text>
          ))}

          {/* Bars */}
          {days.map(([date, data], i) => {
            const x = 28 + i * (barW + gap);
            const purchasedH = (data.purchased / maxVal) * barMaxH;
            const usedH = (data.used / maxVal) * barMaxH;
            const halfBar = barW / 2 - 1;

            return (
              <g key={date}>
                {/* Purchased bar (green, left half) */}
                <rect
                  x={x}
                  y={baseline - purchasedH}
                  width={halfBar}
                  height={purchasedH}
                  rx="2"
                  fill="var(--success)"
                  opacity="0.8"
                >
                  <title>{`${date}: +${data.purchased} credits purchased`}</title>
                </rect>

                {/* Used bar (red/copper, right half) */}
                <rect
                  x={x + halfBar + 2}
                  y={baseline - usedH}
                  width={halfBar}
                  height={usedH}
                  rx="2"
                  fill="var(--danger)"
                  opacity="0.8"
                >
                  <title>{`${date}: -${data.used} credits used`}</title>
                </rect>

                {/* Date label */}
                <text
                  x={x + barW / 2}
                  y={baseline + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--muted)"
                >
                  {date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="p-3 liquid-card border border-green-500/20 text-green-400 text-[12px] flex items-center gap-2">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<CreditHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Custom amount state
  const [customAmount, setCustomAmount] = useState("");
  const [customError, setCustomError] = useState("");

  const successParam = searchParams.get("success");
  const canceledParam = searchParams.get("canceled");

  useEffect(() => {
    Promise.all([
      fetch("/api/user/stats").then((r) => r.json()),
      fetch("/api/credits/history").then((r) => r.json()).catch(() => ({ history: [] })),
    ]).then(([stats, historyData]) => {
      setBalance(stats.credits ?? 0);
      setHistory(historyData.history ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handlePurchasePack = async (packId: string) => {
    setPurchasing(packId);
    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: packId }),
      });

      const data = await res.json();

      if (data.mode === "stripe" && data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.mode === "demo") {
        setBalance(data.newBalance);
        const historyRes = await fetch("/api/credits/history");
        const historyData = await historyRes.json();
        setHistory(historyData.history ?? []);
      }
    } catch {
      // ignore
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

      if (data.mode === "demo") {
        setBalance(data.newBalance);
        setCustomAmount("");
        const historyRes = await fetch("/api/credits/history");
        const historyData = await historyRes.json();
        setHistory(historyData.history ?? []);
      }
    } catch {
      // ignore
    } finally {
      setPurchasing(null);
    }
  };

  const customCredits = customAmount ? Math.floor(parseFloat(customAmount || "0") / CUSTOM_CREDIT_RATE) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
        <Spinner size={20} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Credits</h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Purchase credits and view your usage history</p>
      </div>

      {successParam && <SuccessBanner message="Payment successful! Your credits have been added." />}
      {canceledParam && (
        <div className="p-3 liquid-card border border-amber-500/20 text-amber-400 text-[12px] flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          Payment was canceled. No charges were made.
        </div>
      )}

      {/* Current balance */}
      <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, var(--accent-copper), var(--primary-dark))", color: "#0a0a0f" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.15)" }}>Available Balance</span>
            </div>
            <h3 className="text-4xl font-headline mb-1">{balance ?? 0}</h3>
            <p className="text-sm" style={{ opacity: 0.8 }}>credits available</p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(0,0,0,0.15)" }}>
              1 calendar = 15 credits
            </div>
            <div className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(0,0,0,0.15)" }}>
              1 post = 5 credits
            </div>
          </div>
        </div>
      </div>

      {/* Credit costs */}
      <div className="liquid-card p-6">
        <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>How credits are used</h3>
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

      {/* Buy credits — preset packs */}
      <div>
        <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Buy Credits</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`liquid-card p-6 relative ${pack.popular ? "glow-breathe" : ""}`}
            >
              {pack.popular && (
                <span className="liquid-badge absolute top-4 right-4 z-10">Best Value</span>
              )}
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-3">{pack.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-headline text-3xl" style={{ color: "var(--foreground)" }}>${pack.price}</span>
              </div>
              <p className="text-[12px] text-[var(--muted)] mb-1">{pack.credits} credits</p>
              <p className="text-[11px] text-[var(--muted)] mb-4">{pack.pricePerCredit} per credit</p>
              <button
                onClick={() => handlePurchasePack(pack.id)}
                disabled={purchasing !== null}
                className={`w-full py-2.5 text-[12px] disabled:opacity-50 ${pack.popular ? "liquid-btn-primary" : "liquid-btn"}`}
              >
                {purchasing === pack.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size={12} /> Processing...
                  </span>
                ) : (
                  `Buy ${pack.credits} Credits`
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      <div className="liquid-card p-6">
        <h3 className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>Custom Amount</h3>
        <p className="text-[13px] mb-4" style={{ color: "var(--muted)" }}>
          Enter any amount from ${CUSTOM_CREDIT_MIN_DOLLARS} to ${CUSTOM_CREDIT_MAX_DOLLARS}. Credits calculated at ${CUSTOM_CREDIT_RATE.toFixed(2)}/credit.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium" style={{ color: "var(--muted)" }}>$</span>
            <input
              type="number"
              min={CUSTOM_CREDIT_MIN_DOLLARS}
              max={CUSTOM_CREDIT_MAX_DOLLARS}
              step="1"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setCustomError("");
              }}
              placeholder={`${CUSTOM_CREDIT_MIN_DOLLARS}`}
              className="w-full pl-8 pr-4 py-2.5 liquid-input text-[14px]"
            />
          </div>

          {customCredits > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
              <svg className="w-4 h-4" style={{ color: "var(--accent-copper)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
                {customCredits} credits
              </span>
            </div>
          )}

          <button
            onClick={handleCustomPurchase}
            disabled={purchasing !== null || !customAmount || parseFloat(customAmount) < CUSTOM_CREDIT_MIN_DOLLARS}
            className="px-6 py-2.5 liquid-btn-primary text-[12px] disabled:opacity-50 whitespace-nowrap"
          >
            {purchasing === "custom" ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size={12} /> Processing...
              </span>
            ) : (
              "Buy Credits"
            )}
          </button>
        </div>

        {customError && (
          <p className="text-[12px] mt-2" style={{ color: "var(--danger)" }}>{customError}</p>
        )}
      </div>

      {/* Usage chart */}
      <CreditUsageChart history={history} />

      {/* Credit history */}
      <div className="liquid-card p-6">
        <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Transaction History</h3>
        {history.length === 0 ? (
          <p className="text-[13px] text-center py-6" style={{ color: "var(--muted)" }}>
            No transactions yet. Purchase credits to get started.
          </p>
        ) : (
          <div className="space-y-0">
            {history.map((entry, i) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-3"
                style={{ borderBottom: i < history.length - 1 ? "1px solid var(--lg-border)" : "none" }}
              >
                <div>
                  <p className="text-[13px]" style={{ color: "var(--foreground)" }}>
                    {entry.description || entry.type}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: entry.amount > 0 ? "var(--success)" : "var(--danger)" }}
                >
                  {entry.amount > 0 ? "+" : ""}{entry.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
