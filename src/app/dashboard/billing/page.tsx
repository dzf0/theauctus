"use client";

import { useState } from "react";
import { creatorProfile } from "@/lib/store";
import type { PlanTier } from "@/lib/types";

const plans: { tier: PlanTier; name: string; price: number; features: string[]; limits: string }[] = [
  { tier: "starter", name: "Starter", price: 29, limits: "30 AI posts/mo · 3 platforms", features: ["AI content calendar (30 posts/month)", "3 connected platforms", "Basic analytics dashboard", "Content scheduling", "Email support"] },
  { tier: "growth", name: "Growth", price: 79, limits: "Unlimited AI posts · All platforms", features: ["Unlimited AI content generation", "All platforms connected", "Advanced analytics + revenue tracking", "Content repurposing engine", "Growth tactics engine", "Priority support", "Referral program"] },
  { tier: "scale", name: "Scale", price: 199, limits: "Unlimited everything · 5 team seats", features: ["Everything in Growth", "Team seats (up to 5)", "Custom AI training on your brand", "White-label client reporting", "API access", "Dedicated account manager", "Custom integrations"] },
];

const invoices = [
  { date: "Aug 22, 2026", amount: 79, status: "paid", plan: "Growth" },
  { date: "Jul 22, 2026", amount: 79, status: "paid", plan: "Growth" },
  { date: "Jun 22, 2026", amount: 29, status: "paid", plan: "Starter" },
];

export default function BillingPage() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const currentPlan = plans.find((p) => p.tier === creatorProfile.plan) || plans[1];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Billing & Subscription</h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Manage your plan, payment method, and view invoices</p>
      </div>

      {/* Current plan */}
      <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, var(--accent-copper), var(--primary-dark))", color: "#0a0a0f" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.15)" }}>Current Plan</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(34, 197, 94, 0.3)" }}>Active</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{currentPlan.name} — ${currentPlan.price}/mo</h3>
            <p className="text-sm" style={{ opacity: 0.8 }}>{currentPlan.limits}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowUpgrade(true)} className="px-4 py-2 font-medium rounded-xl text-sm" style={{ background: "rgba(0,0,0,0.15)" }}>Change Plan</button>
            <button className="px-4 py-2 font-medium rounded-xl text-sm" style={{ background: "rgba(0,0,0,0.1)" }}>Cancel</button>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "AI Posts Generated", used: 247, limit: "Unlimited", percent: 82 },
          { label: "Connected Platforms", used: 5, limit: "Unlimited", percent: 100 },
          { label: "Storage Used", used: "2.3 GB", limit: "10 GB", percent: 23 },
        ].map((usage, i) => (
          <div key={i} className="liquid-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: "var(--muted)" }}>{usage.label}</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{usage.used} / {usage.limit}</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--lg-bg)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${usage.percent}%`, background: "var(--accent-copper)" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Payment */}
      <div className="liquid-card p-6">
        <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Payment Method</h3>
        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
          <div className="w-12 h-8 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1f71, #2e3192)" }}>
            <span className="text-white text-xs font-bold">VISA</span>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>•••• •••• •••• 4242</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Expires 12/2028</p>
          </div>
          <button className="ml-auto text-sm font-medium accent-text hover:opacity-80">Update</button>
        </div>
      </div>

      {/* Invoices */}
      <div className="liquid-card p-6">
        <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Invoice History</h3>
        <div className="space-y-0">
          {invoices.map((invoice, i) => (
            <div key={i} className="flex items-center justify-between py-3" style={{ borderBottom: i < invoices.length - 1 ? "1px solid var(--lg-border)" : "none" }}>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: "var(--muted)" }}>{invoice.date}</span>
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{invoice.plan}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>${invoice.amount}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(124, 184, 124, 0.1)", color: "var(--success)" }}>{invoice.status}</span>
                <button className="text-xs hover:opacity-80" style={{ color: "var(--muted)" }}>Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue */}
      <div className="liquid-card p-6">
        <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>💰 Your Revenue Pipeline</h3>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Track how TheAuctus is helping you earn.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Newsletter Revenue", value: "$2,400/mo", trend: "+18%", icon: "📧" },
            { label: "Affiliate Income", value: "$1,800/mo", trend: "+24%", icon: "🔗" },
            { label: "Sponsorship", value: "$600/mo", trend: "+10%", icon: "🤝" },
          ].map((revenue, i) => (
            <div key={i} className="p-4 rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span>{revenue.icon}</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{revenue.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{revenue.value}</span>
                <span className="text-xs font-medium" style={{ color: "var(--success)" }}>{revenue.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="liquid-card max-w-4xl w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Change Your Plan</h3>
              <button onClick={() => setShowUpgrade(false)} className="hover:opacity-70" style={{ color: "var(--muted)" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isCurrent = plan.tier === creatorProfile.plan;
                return (
                  <div key={plan.tier} className="rounded-xl p-5" style={{ border: `2px solid ${isCurrent ? "var(--accent-copper)" : "var(--lg-border)"}`, background: isCurrent ? "rgba(201, 168, 124, 0.05)" : "var(--lg-bg)" }}>
                    {isCurrent && <span className="text-xs px-2 py-0.5 rounded-full mb-3 inline-block liquid-badge">Current Plan</span>}
                    <h4 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{plan.name}</h4>
                    <p className="text-2xl font-bold mt-2" style={{ color: "var(--foreground)" }}>${plan.price}<span className="text-sm font-normal" style={{ color: "var(--muted)" }}>/mo</span></p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs" style={{ color: "var(--muted)" }}>
                          <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--success)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {!isCurrent && (
                      <button className="w-full mt-4 py-2 text-sm font-medium rounded-lg liquid-btn-primary">
                        {plan.price > currentPlan.price ? "Upgrade" : "Downgrade"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
