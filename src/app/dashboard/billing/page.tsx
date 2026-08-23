"use client";

import { useState } from "react";
import { creatorProfile } from "@/lib/store";
import type { PlanTier } from "@/lib/types";

const plans: {
  tier: PlanTier;
  name: string;
  price: number;
  features: string[];
  limits: string;
}[] = [
  {
    tier: "starter",
    name: "Starter",
    price: 29,
    limits: "30 AI posts/mo · 3 platforms",
    features: [
      "AI content calendar (30 posts/month)",
      "3 connected platforms",
      "Basic analytics dashboard",
      "Content scheduling",
      "Email support",
    ],
  },
  {
    tier: "growth",
    name: "Growth",
    price: 79,
    limits: "Unlimited AI posts · All platforms",
    features: [
      "Unlimited AI content generation",
      "All platforms connected",
      "Advanced analytics + revenue tracking",
      "Content repurposing engine",
      "Growth tactics engine",
      "Priority support",
      "Referral program",
    ],
  },
  {
    tier: "scale",
    name: "Scale",
    price: 199,
    limits: "Unlimited everything · 5 team seats",
    features: [
      "Everything in Growth",
      "Team seats (up to 5)",
      "Custom AI training on your brand",
      "White-label client reporting",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
];

const invoices = [
  { date: "Aug 22, 2026", amount: 79, status: "paid", plan: "Growth" },
  { date: "Jul 22, 2026", amount: 79, status: "paid", plan: "Growth" },
  { date: "Jun 22, 2026", amount: 29, status: "paid", plan: "Starter" },
  { date: "May 22, 2026", amount: 29, status: "paid", plan: "Starter" },
  { date: "Apr 22, 2026", amount: 29, status: "paid", plan: "Starter" },
];

export default function BillingPage() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const currentPlan = plans.find((p) => p.tier === creatorProfile.plan) || plans[1];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-white">Billing & Subscription</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your plan, payment method, and view invoices
        </p>
      </div>

      {/* ── Current plan ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current Plan</span>
              <span className="text-xs bg-green-500/30 text-green-100 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {currentPlan.name} — ${currentPlan.price}/mo
            </h3>
            <p className="text-indigo-100 text-sm">{currentPlan.limits}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-4 py-2 bg-white text-indigo-400 font-medium rounded-xl hover:bg-indigo-50 transition-colors text-sm"
            >
              Change Plan
            </button>
            <button className="px-4 py-2 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* ── Usage stats ─────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            label: "AI Posts Generated",
            used: 247,
            limit: "Unlimited",
            percent: 82,
          },
          {
            label: "Connected Platforms",
            used: 5,
            limit: "Unlimited",
            percent: 100,
          },
          {
            label: "Storage Used",
            used: "2.3 GB",
            limit: "10 GB",
            percent: 23,
          },
        ].map((usage, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">{usage.label}</span>
              <span className="text-xs text-slate-500">
                {usage.used} / {usage.limit}
              </span>
            </div>
            <div className="w-full h-2 glass-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${usage.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Payment method ──────────────────────────────────── */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4">Payment Method</h3>
        <div className="flex items-center gap-4 p-4 glass-subtle rounded-xl">
          <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">VISA</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">•••• •••• •••• 4242</p>
            <p className="text-xs text-slate-500">Expires 12/2028</p>
          </div>
          <button className="ml-auto text-sm text-indigo-400 hover:text-indigo-800 font-medium">
            Update
          </button>
        </div>
      </div>

      {/* ── Invoice history ─────────────────────────────────── */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4">Invoice History</h3>
        <div className="space-y-3">
          {invoices.map((invoice, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{invoice.date}</span>
                <span className="text-sm font-medium text-white">{invoice.plan}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">${invoice.amount}</span>
                <span className="text-xs text-green-400 bg-green-50 px-2 py-0.5 rounded-full">
                  {invoice.status}
                </span>
                <button className="text-xs text-slate-500 hover:text-slate-300">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Revenue tracking ────────────────────────────────── */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4">💰 Your Revenue Pipeline</h3>
        <p className="text-sm text-slate-500 mb-4">
          Track how TheAuctus is helping you earn. This data comes from your connected platforms.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Newsletter Revenue", value: "$2,400/mo", trend: "+18%", icon: "📧" },
            { label: "Affiliate Income", value: "$1,800/mo", trend: "+24%", icon: "🔗" },
            { label: "Sponsorship", value: "$600/mo", trend: "+10%", icon: "🤝" },
          ].map((revenue, i) => (
            <div key={i} className="glass-subtle glass-subtle p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{revenue.icon}</span>
                <span className="text-xs text-slate-500">{revenue.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">{revenue.value}</span>
                <span className="text-xs text-green-400 font-medium">{revenue.trend}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-green-50 glass-subtle border border-[#7cb87c]/20">
          <p className="text-sm text-green-800">
            <span className="font-semibold">ROI: </span>
            TheAuctus costs $79/mo and is generating $4,800/mo in tracked revenue. That&apos;s a{" "}
            <span className="font-bold">60x return on investment</span>.
          </p>
        </div>
      </div>

      {/* ── Upgrade modal ───────────────────────────────────── */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Change Your Plan</h3>
              <button
                onClick={() => setShowUpgrade(false)}
                className="text-slate-500 hover:text-slate-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isCurrent = plan.tier === creatorProfile.plan;
                return (
                  <div
                    key={plan.tier}
                    className={`rounded-xl border-2 p-5 ${
                      isCurrent
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-white/[0.08] hover:border-gray-300"
                    }`}
                  >
                    {isCurrent && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full mb-3 inline-block">
                        Current Plan
                      </span>
                    )}
                    <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                    <p className="text-2xl font-bold text-white mt-2">
                      ${plan.price}<span className="text-sm font-normal text-slate-500">/mo</span>
                    </p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-slate-400">
                          <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {!isCurrent && (
                      <button className="w-full mt-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
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
