"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  {
    icon: "🧠",
    title: "AI Content Planner",
    description:
      "Tell AI your niche and keywords. Get a 30-day content calendar with platform-specific posts, optimal timing, and hashtag strategy.",
  },
  {
    icon: "📅",
    title: "Auto-Publish Everywhere",
    description:
      "Connect Twitter, LinkedIn, Instagram, TikTok, YouTube, Threads, and your blog. One click schedules across all platforms.",
  },
  {
    icon: "📊",
    title: "Growth Analytics",
    description:
      "Real-time tracking of followers, engagement, reach, and revenue across every platform.",
  },
  {
    icon: "🔄",
    title: "Content Repurposing",
    description:
      "One idea becomes 10 pieces. Auto-convert long-form to threads, carousels, reels, and blog posts.",
  },
  {
    icon: "🎯",
    title: "Growth Tactics Engine",
    description:
      "AI analyzes your metrics and suggests specific, actionable growth tactics based on YOUR data.",
  },
  {
    icon: "💰",
    title: "Revenue Tracking",
    description:
      "Track newsletter subscribers, affiliate revenue, and sponsorship income.",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: 29,
    description: "For creators ready to systematize their content",
    features: [
      "AI content calendar (30 posts/mo)",
      "3 connected platforms",
      "Basic analytics",
      "Content scheduling",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Growth",
    price: 79,
    description: "For serious creators scaling their audience",
    features: [
      "Unlimited AI generation",
      "All platforms connected",
      "Advanced analytics + revenue",
      "Content repurposing engine",
      "Growth tactics engine",
      "Priority support",
      "Referral program",
    ],
    popular: true,
  },
  {
    name: "Scale",
    price: 199,
    description: "For creators and teams building empires",
    features: [
      "Everything in Growth",
      "Team seats (up to 5)",
      "Custom AI training",
      "White-label reporting",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
    popular: false,
  },
];

const faqs = [
  {
    q: "How does the AI content planning work?",
    a: "Tell us your niche, brand voice, and target audience. Our AI generates a complete 30-day content calendar with platform-specific posts, optimal posting times, hashtags, and content pillars.",
  },
  {
    q: "Which platforms do you support?",
    a: "Twitter/X, LinkedIn, Instagram, TikTok, YouTube, Threads, Facebook, and WordPress blogs. Each post is optimized for its platform.",
  },
  {
    q: "Can I edit AI-generated content?",
    a: "Absolutely. Every post is fully editable. The AI gives you a strong starting point — you refine it to match your voice.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — 14 days free on any plan. No credit card required. Cancel anytime.",
  },
  {
    q: "How is this different from Buffer/Hootsuite?",
    a: "Those are scheduling tools. TheAuctus is a growth engine — it plans your content, tells you WHAT to post, optimizes timing, and suggests growth tactics based on your metrics.",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen">
      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="TheAuctus" className="w-8 h-8" />
              <span className="font-headline text-xl tracking-tight text-foreground">
                The<span className="accent-text">Auctus</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-[11px] uppercase tracking-[0.12em] text-[#6b6560] hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-[11px] uppercase tracking-[0.12em] text-[#6b6560] hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-[11px] uppercase tracking-[0.12em] text-[#6b6560] hover:text-foreground transition-colors">
                FAQ
              </a>
              <Link href="/auth/signup" className="glass-btn-primary text-[11px]">
                Start Free Trial
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-[#6b6560]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.04] bg-[#111]/95 backdrop-blur-xl px-6 py-6 space-y-4">
            <a href="#features" className="block text-[11px] uppercase tracking-[0.12em] text-[#6b6560]">Features</a>
            <a href="#pricing" className="block text-[11px] uppercase tracking-[0.12em] text-[#6b6560]">Pricing</a>
            <a href="#faq" className="block text-[11px] uppercase tracking-[0.12em] text-[#6b6560]">FAQ</a>
            <Link href="/auth/signup" className="block glass-btn-primary text-center text-[11px]">
              Start Free Trial
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero — Editorial Style ──────────────────────────── */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Left: Typography */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-8 animate-fade-in">
                Automated Creator Growth Engine
              </p>

              <h1 className="font-headline text-6xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] text-[#f5f0eb] mb-8 animate-fade-in-up">
                Stop creating
                <br />
                content.
                <br />
                <span className="text-[#8b8fa3] italic">Start</span>{" "}
                <span className="accent-text italic">engineering</span>{" "}
                it.
              </h1>

              <p className="text-[13px] text-[#6b6560] leading-relaxed max-w-md mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                TheAuctus automates your content planning, publishing, and audience growth with AI.
                Schedule 30 days of content across every platform in minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex w-full sm:w-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 sm:w-64 px-4 py-3 glass-input rounded-r-none border-r-0 text-sm"
                  />
                  <button
                    onClick={() => setSubmitted(true)}
                    className="px-6 py-3 glass-btn-primary rounded-l-none text-sm"
                  >
                    {submitted ? "✓ You're in!" : "Start Free →"}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#6b6560] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                No credit card · 14-day free trial · Cancel anytime
              </p>
            </div>

            {/* Right: Visual */}
            <div className="relative flex items-center justify-center">
              {/* 3D Blob visual — editorial style */}
              <div className="relative w-full max-w-lg aspect-square">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#111] opacity-80 animate-blob" />
                <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-[#1e1e1e] via-[#252525] to-[#1a1a1a] opacity-60" />
                <div className="absolute inset-16 rounded-full bg-gradient-to-bl from-[#222] via-[#1a1a1a] to-[#161616] opacity-40" />
                
                {/* Floating spec cards — like the Dribbble design */}
                <div className="absolute top-12 left-4 glass-card p-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                  <div className="spec-list">
                    <strong>Posts Scheduled</strong><br />
                    47 this week<br />
                    +12 vs last week
                  </div>
                </div>

                <div className="absolute bottom-20 right-4 glass-card p-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <p className="accent-text font-headline text-3xl tracking-tight">30.1K</p>
                  <p className="spec-list mt-1">Total followers</p>
                </div>

                <div className="absolute top-1/3 right-0 glass-card p-3 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                  <p className="spec-list">
                    <strong>4.8%</strong> engagement<br />
                    <strong>89.3K</strong> reach
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof — minimal ──────────────────────────── */}
      <section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { value: "30×", label: "Faster content creation" },
              { value: "4.8%", label: "Avg. engagement rate" },
              { value: "2.8K", label: "Active creators" },
              { value: "$2.4M", label: "Revenue generated" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="font-headline text-4xl sm:text-5xl tracking-tight text-[#f5f0eb] mb-2">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#6b6560]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — editorial grid ───────────────────────── */}
      <section id="features" className="py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-4">The Engine</p>
            <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-[#f5f0eb] max-w-2xl leading-[1.05]">
              Everything you need to grow.
              <span className="text-[#6b6560]"> Nothing you don&apos;t.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-[#111] hover:bg-white/[0.02] transition-colors group"
              >
                <span className="text-2xl mb-6 block">{feature.icon}</span>
                <h3 className="font-headline text-xl text-[#f5f0eb] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[13px] text-[#6b6560] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works — editorial ────────────────────────── */}
      <section className="py-32 px-6 lg:px-12 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-20">
            <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-4">Process</p>
            <h2 className="font-headline text-4xl sm:text-5xl text-[#f5f0eb] leading-[1.05]">
              From zero to 30 days of content.
              <span className="text-[#6b6560]"> Three steps.</span>
            </h2>
          </div>

          <div className="space-y-0">
            {[
              {
                step: "01",
                title: "Tell AI about your brand",
                description:
                  "Enter your niche, keywords, and brand voice. Connect your platforms. Takes 2 minutes.",
              },
              {
                step: "02",
                title: "Review your content calendar",
                description:
                  "AI generates 30+ platform-specific posts with optimal timing, hashtags, and content pillars.",
              },
              {
                step: "03",
                title: "Watch it grow",
                description:
                  "Content auto-publishes across all platforms. Analytics track everything. Growth engine suggests new tactics weekly.",
              },
            ].map((step, i) => (
              <div key={i} className="grid grid-cols-[80px_1fr] gap-8 py-10 border-t border-white/[0.04]">
                <span className="font-headline text-3xl text-[#3a3a3a]">{step.step}</span>
                <div>
                  <h3 className="font-headline text-2xl text-[#f5f0eb] mb-3">{step.title}</h3>
                  <p className="text-[13px] text-[#6b6560] leading-relaxed max-w-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials — editorial ────────────────────────── */}
      <section className="py-32 px-6 lg:px-12 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-4">Testimonials</p>
            <h2 className="font-headline text-4xl sm:text-5xl text-[#f5f0eb] leading-[1.05]">
              Join 2,800+ creators
              <span className="text-[#6b6560]"> already growing.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/[0.04]">
            {[
              {
                name: "Maya Chen",
                role: "AI Educator · 45K followers",
                quote: "I went from 3 hours/day on content to 15 minutes. TheAuctus handles planning, scheduling, and tells me what to post next.",
                avatar: "MC",
              },
              {
                name: "Jordan Park",
                role: "Fitness Creator · 120K followers",
                quote: "The AI planner understands my brand voice better than the freelancer I was paying $2K/mo. This is the future.",
                avatar: "JP",
              },
              {
                name: "Sam Torres",
                role: "SaaS Founder · 8K followers",
                quote: "Grew my LinkedIn from 2K to 8K in 60 days. The growth tactics engine told me to post carousels on Tuesdays and my engagement 4x'd.",
                avatar: "ST",
              },
            ].map((t, i) => (
              <div key={i} className="p-8 bg-[#111]">
                <p className="text-[13px] text-[#9a9590] leading-relaxed italic mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1e1e1e] border border-white/[0.06] flex items-center justify-center text-[10px] accent-text font-medium">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[12px] text-[#f5f0eb] font-medium">{t.name}</p>
                    <p className="text-[10px] text-[#6b6560]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing — editorial ─────────────────────────────── */}
      <section id="pricing" className="py-32 px-6 lg:px-12 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20">
            <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-4">Pricing</p>
            <h2 className="font-headline text-4xl sm:text-5xl text-[#f5f0eb] leading-[1.05]">
              Invest in your
              <span className="text-[#6b6560]"> growth engine.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/[0.04]">
            {pricingTiers.map((tier, i) => (
              <div
                key={i}
                className={`p-8 bg-[#111] relative ${
                  tier.popular ? "border border-[#c9a87c]/20" : ""
                }`}
              >
                {tier.popular && (
                  <span className="glass-badge absolute top-6 right-6">
                    Popular
                  </span>
                )}
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#6b6560] mb-4">{tier.name}</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-headline text-5xl text-[#f5f0eb]">${tier.price}</span>
                  <span className="text-[11px] text-[#6b6560]">/mo</span>
                </div>
                <p className="text-[12px] text-[#6b6560] mb-8">{tier.description}</p>
                <ul className="space-y-3 mb-10">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-[12px] text-[#9a9590]">
                      <span className="accent-text mt-0.5">—</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block w-full text-center py-3 ${
                    tier.popular ? "glass-btn-primary" : "glass-btn"
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — editorial ─────────────────────────────────── */}
      <section id="faq" className="py-32 px-6 lg:px-12 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-4">FAQ</p>
            <h2 className="font-headline text-4xl sm:text-5xl text-[#f5f0eb]">
              Questions? Answered.
            </h2>
          </div>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-t border-white/[0.04]">
                <button
                  className="w-full py-5 text-left flex items-center justify-between group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-[14px] text-[#f5f0eb] group-hover:text-accent-text transition-colors">
                    {faq.q}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[#6b6560] transition-transform shrink-0 ml-4 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="pb-5 text-[13px] text-[#6b6560] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA — editorial ───────────────────────────── */}
      <section className="py-32 px-6 lg:px-12 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline text-5xl sm:text-6xl text-[#f5f0eb] mb-6 leading-[1.05]">
            Ready to build your<br />
            <span className="accent-text italic">growth engine?</span>
          </h2>
          <p className="text-[13px] text-[#6b6560] mb-10 max-w-lg mx-auto">
            Join 2,800+ creators who automated their content and scaled their audience — without hiring anyone.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 glass-btn-primary"
          >
            Start Your Free Trial →
          </Link>
          <p className="text-[11px] text-[#6b6560] mt-6">
            No credit card · 14 days free · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer — editorial ──────────────────────────────── */}
      <footer className="py-12 px-6 lg:px-12 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="TheAuctus" className="w-6 h-6" />
            <span className="font-headline text-lg text-[#f5f0eb]">
              The<span className="accent-text">Auctus</span>
            </span>
          </div>
          <p className="text-[11px] text-[#6b6560]">
            © 2026 TheAuctus. Built by creators, for creators.
          </p>
          <div className="flex items-center gap-8 text-[11px] text-[#6b6560]">
            <a href="#" className="hover:text-[#f5f0eb] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#f5f0eb] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#f5f0eb] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
