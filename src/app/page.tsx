"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/components/user-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useInView } from "@/hooks/use-in-view";
import { ThreeDCard } from "@/components/three-d-card";
import { HeroVisual } from "@/components/hero-visual";

// ── Reveal wrapper ──────────────────────────────────────────────
function Reveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "left" | "right" | "scale" | "3d";
  delay?: number;
}) {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const dirClass =
    direction === "left"
      ? "reveal-left"
      : direction === "right"
      ? "reveal-right"
      : direction === "scale"
      ? "reveal-scale"
      : direction === "3d"
      ? "reveal-3d"
      : "reveal";

  return (
    <div
      ref={ref}
      className={`${dirClass} ${isInView ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

// ── Animated number ─────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [ref, isInView] = useInView();
  return (
    <span ref={ref} className={isInView ? "number-shimmer" : ""}>
      {value}
      {suffix}
    </span>
  );
}

// ── Data ────────────────────────────────────────────────────────
const features = [
  { icon: "🧠", title: "AI Content Planner", description: "Tell AI your niche and keywords. Get a 30-day content calendar with platform-specific posts, optimal timing, and hashtag strategy." },
  { icon: "📅", title: "Auto-Publish Everywhere", description: "Connect Twitter, LinkedIn, Instagram, TikTok, YouTube, Threads, and your blog. One click schedules across all platforms." },
  { icon: "📊", title: "Growth Analytics", description: "Real-time tracking of followers, engagement, reach, and revenue across every platform." },
  { icon: "🔄", title: "Content Repurposing", description: "One idea becomes 10 pieces. Auto-convert long-form to threads, carousels, reels, and blog posts." },
  { icon: "🎯", title: "Growth Tactics Engine", description: "AI analyzes your metrics and suggests specific, actionable growth tactics based on YOUR data." },
  { icon: "💰", title: "Revenue Tracking", description: "Track newsletter subscribers, affiliate revenue, and sponsorship income." },
];

const pricingTiers = [
  { name: "Starter", price: 29, description: "For creators ready to systematize their content", features: ["AI content calendar (30 posts/mo)", "3 connected platforms", "Basic analytics", "Content scheduling", "Email support"], popular: false },
  { name: "Growth", price: 79, description: "For serious creators scaling their audience", features: ["Unlimited AI generation", "All platforms connected", "Advanced analytics + revenue", "Content repurposing engine", "Growth tactics engine", "Priority support", "Referral program"], popular: true },
  { name: "Scale", price: 199, description: "For creators and teams building empires", features: ["Everything in Growth", "Team seats (up to 5)", "Custom AI training", "White-label reporting", "API access", "Dedicated account manager", "Custom integrations"], popular: false },
];

const faqs = [
  { q: "How does the AI content planning work?", a: "Tell us your niche, brand voice, and target audience. Our AI generates a complete 30-day content calendar with platform-specific posts, optimal posting times, hashtags, and content pillars." },
  { q: "Which platforms do you support?", a: "Twitter/X, LinkedIn, Instagram, TikTok, YouTube, Threads, Facebook, and WordPress blogs. Each post is optimized for its platform." },
  { q: "Can I edit AI-generated content?", a: "Absolutely. Every post is fully editable. The AI gives you a strong starting point — you refine it to match your voice." },
  { q: "Is there a free trial?", a: "Yes — 14 days free on any plan. No credit card required. Cancel anytime." },
  { q: "How is this different from Buffer/Hootsuite?", a: "Those are scheduling tools. TheAuctus is a growth engine — it plans your content, tells you WHAT to post, optimizes timing, and suggests growth tactics based on your metrics." },
];

// ── Animated Hero Characters ────────────────────────────────────
function AnimatedHeadline({ text, className = "" }: { text: string; className?: string }) {
  const [ref, isInView] = useInView({ threshold: 0.3 });
  return (
    <span ref={ref} className={className}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="char-animate inline-block"
          style={{
            animationDelay: isInView ? `${i * 0.03}s` : "0s",
            opacity: isInView ? undefined : 0,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const user = useUser();

  // Parallax
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 liquid-glass-strong" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="TheAuctus" className="w-8 h-8" />
              <span className="font-headline text-xl tracking-tight text-foreground">
                The<span className="accent-text">Auctus</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-foreground transition-colors link-underline">Features</a>
              <a href="#pricing" className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-foreground transition-colors link-underline">Pricing</a>
              <a href="#faq" className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-foreground transition-colors link-underline">FAQ</a>
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="liquid-btn-primary text-[11px]">Dashboard</Link>
                  <form action="/api/auth/signout" method="POST" className="inline">
                    <button type="submit" className="text-[11px] text-[var(--muted)] hover:text-foreground transition-colors">Sign out</button>
                  </form>
                </div>
              ) : (
                <Link href="/auth/signup" className="liquid-btn-primary text-[11px]">Get Started</Link>
              )}
            </div>
            <button className="md:hidden p-2 text-[var(--muted)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--lg-border)] px-6 py-6 space-y-4" style={{ background: "var(--lg-bg-strong)", backdropFilter: "blur(40px)" }}>
            <a href="#features" className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Features</a>
            <a href="#pricing" className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Pricing</a>
            <a href="#faq" className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">FAQ</a>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Theme</span>
              <ThemeToggle />
            </div>
            {user ? (
              <div className="space-y-4">
                <Link href="/dashboard" className="block liquid-btn-primary text-center text-[11px]">Dashboard</Link>
                <form action="/api/auth/signout" method="POST"><button type="submit" className="block w-full text-center text-[11px] text-[var(--muted)]">Sign out</button></form>
              </div>
            ) : (
              <Link href="/auth/signup" className="block liquid-btn-primary text-center text-[11px]">Get Started</Link>
            )}
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full" style={{ background: "radial-gradient(circle, rgba(201,168,124,0.06) 0%, transparent 60%)", filter: "blur(80px)" }} />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(124,158,201,0.04) 0%, transparent 60%)", filter: "blur(60px)" }} />
        </div>
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="perspective-2000">
              <Reveal direction="3d">
                <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-8">Automated Creator Growth Engine</p>
              </Reveal>
              <Reveal direction="3d" delay={0.1}>
                <h1 className="font-headline text-6xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] text-[var(--foreground)] mb-8">
                  <AnimatedHeadline text="Stop creating" /><br />
                  <AnimatedHeadline text="content." /><br />
                  <span className="text-[var(--muted)] italic"><AnimatedHeadline text="Start" /></span>{" "}
                  <span className="gradient-text-animated italic"><AnimatedHeadline text="engineering" /></span>{" "}
                  <AnimatedHeadline text="it." />
                </h1>
              </Reveal>
              <Reveal direction="3d" delay={0.3}>
                <p className="text-[13px] text-[var(--muted)] leading-relaxed max-w-md mb-10">
                  TheAuctus automates your content planning, publishing, and audience growth with AI. Schedule 30 days of content across every platform in minutes.
                </p>
              </Reveal>
              <Reveal direction="3d" delay={0.4}>
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
                  {user ? (
                    <Link href="/dashboard" className="liquid-btn-primary text-[13px]">Go to Dashboard →</Link>
                  ) : (
                    <Link href="/auth/signup" className="liquid-btn-primary text-[13px]">Get Started — It's Free →</Link>
                  )}
                </div>
                {!user && (
                  <p className="text-[12px] text-[var(--muted)]">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="accent-text hover:text-[var(--primary-light)] transition-colors">Sign in</Link>
                  </p>
                )}
              </Reveal>
              <Reveal direction="3d" delay={0.5}>
                <p className="text-[11px] text-[var(--muted)] mt-4">No credit card · 14-day free trial · Cancel anytime</p>
              </Reveal>
            </div>

            {/* Hero visual — dashboard mockup with floating cards */}
            <div className="relative flex items-center justify-center perspective-2000">
              <Reveal direction="scale" delay={0.3}>
                <HeroVisual />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof ────────────────────────────────────── */}
      <section className="py-16 border-y border-[var(--lg-border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { value: "30×", label: "Faster content creation" },
              { value: "4.8%", label: "Avg. engagement rate" },
              { value: "2.8K", label: "Active creators" },
              { value: "$2.4M", label: "Revenue generated" },
            ].map((stat, i) => (
              <Reveal key={i} direction="up" delay={i * 0.1}>
                <div>
                  <p className="font-headline text-4xl sm:text-5xl tracking-tight text-[var(--foreground)] mb-2">
                    <AnimatedNumber value={stat.value} />
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="mb-20">
              <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-4">The Engine</p>
              <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-[var(--foreground)] max-w-2xl leading-[1.05]">
                Everything you need to grow.
                <span className="text-[var(--muted)]"> Nothing you don&apos;t.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Reveal key={i} direction="3d" delay={i * 0.08}>
                <ThreeDCard intensity={10} className="liquid-card p-8 h-full">
                  <span className="text-3xl mb-6 block relative z-10">{feature.icon}</span>
                  <h3 className="font-headline text-xl text-[var(--foreground)] mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-[13px] text-[var(--muted)] leading-relaxed relative z-10">{feature.description}</p>
                </ThreeDCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="py-32 px-6 lg:px-12 border-t border-[var(--lg-border)]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="mb-20">
              <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-4">Process</p>
              <h2 className="font-headline text-4xl sm:text-5xl text-[var(--foreground)] leading-[1.05]">
                From zero to 30 days of content.
                <span className="text-[var(--muted)]"> Three steps.</span>
              </h2>
            </div>
          </Reveal>
          <div className="space-y-0">
            {[
              { step: "01", title: "Tell AI about your brand", description: "Enter your niche, keywords, and brand voice. Connect your platforms. Takes 2 minutes." },
              { step: "02", title: "Review your content calendar", description: "AI generates 30+ platform-specific posts with optimal timing, hashtags, and content pillars." },
              { step: "03", title: "Watch it grow", description: "Content auto-publishes across all platforms. Analytics track everything. Growth engine suggests new tactics weekly." },
            ].map((step, i) => (
              <Reveal key={i} direction="left" delay={i * 0.15}>
                <div className="grid grid-cols-[80px_1fr] gap-8 py-10 border-t border-[var(--lg-border)]">
                  <span className="font-headline text-3xl text-[var(--muted)] opacity-40">{step.step}</span>
                  <div>
                    <h3 className="font-headline text-2xl text-[var(--foreground)] mb-3">{step.title}</h3>
                    <p className="text-[13px] text-[var(--muted)] leading-relaxed max-w-lg">{step.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="py-32 px-6 lg:px-12 border-t border-[var(--lg-border)]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="mb-20">
              <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-4">Testimonials</p>
              <h2 className="font-headline text-4xl sm:text-5xl text-[var(--foreground)] leading-[1.05]">
                Join 2,800+ creators
                <span className="text-[var(--muted)]"> already growing.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Maya Chen", role: "AI Educator · 45K followers", quote: "I went from 3 hours/day on content to 15 minutes. TheAuctus handles planning, scheduling, and tells me what to post next.", avatar: "MC" },
              { name: "Jordan Park", role: "Fitness Creator · 120K followers", quote: "The AI planner understands my brand voice better than the freelancer I was paying $2K/mo. This is the future.", avatar: "JP" },
              { name: "Sam Torres", role: "SaaS Founder · 8K followers", quote: "Grew my LinkedIn from 2K to 8K in 60 days. The growth tactics engine told me to post carousels on Tuesdays and my engagement 4x'd.", avatar: "ST" },
            ].map((t, i) => (
              <Reveal key={i} direction="3d" delay={i * 0.1}>
                <ThreeDCard intensity={8} className="liquid-card p-8 h-full">
                  <p className="text-[13px] text-[var(--muted)] leading-relaxed italic mb-8 relative z-10">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full liquid-card flex items-center justify-center text-[10px] accent-text font-medium">{t.avatar}</div>
                    <div>
                      <p className="text-[12px] text-[var(--foreground)] font-medium">{t.name}</p>
                      <p className="text-[10px] text-[var(--muted)]">{t.role}</p>
                    </div>
                  </div>
                </ThreeDCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="py-32 px-6 lg:px-12 border-t border-[var(--lg-border)]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="mb-20">
              <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-4">Pricing</p>
              <h2 className="font-headline text-4xl sm:text-5xl text-[var(--foreground)] leading-[1.05]">
                Invest in your
                <span className="text-[var(--muted)]"> growth engine.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, i) => (
              <Reveal key={i} direction="3d" delay={i * 0.1}>
                <ThreeDCard intensity={10} className={`liquid-card p-8 h-full relative ${tier.popular ? "glow-breathe" : ""}`}>
                  {tier.popular && <span className="liquid-badge absolute top-6 right-6 z-10">Popular</span>}
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-4 relative z-10">{tier.name}</p>
                  <div className="flex items-baseline gap-1 mb-3 relative z-10">
                    <span className="font-headline text-5xl text-[var(--foreground)]">${tier.price}</span>
                    <span className="text-[11px] text-[var(--muted)]">/mo</span>
                  </div>
                  <p className="text-[12px] text-[var(--muted)] mb-8 relative z-10">{tier.description}</p>
                  <ul className="space-y-3 mb-10 relative z-10">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-[12px] text-[var(--cool-grey)]">
                        <span className="accent-text mt-0.5">—</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signup" className={`block w-full text-center py-3 relative z-10 ${tier.popular ? "liquid-btn-primary" : "liquid-btn"}`}>Start Free Trial</Link>
                </ThreeDCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className="py-32 px-6 lg:px-12 border-t border-[var(--lg-border)]">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="mb-16">
              <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-4">FAQ</p>
              <h2 className="font-headline text-4xl sm:text-5xl text-[var(--foreground)]">Questions? Answered.</h2>
            </div>
          </Reveal>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <Reveal key={i} direction="up" delay={i * 0.05}>
                <div className="border-t border-[var(--lg-border)]">
                  <button className="w-full py-5 text-left flex items-center justify-between group" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="text-[14px] text-[var(--foreground)] group-hover:text-accent-text transition-colors">{faq.q}</span>
                    <svg className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${openFaq === i ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="text-[13px] text-[var(--muted)] leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="py-32 px-6 lg:px-12 border-t border-[var(--lg-border)]">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal direction="3d">
            <h2 className="font-headline text-5xl sm:text-6xl text-[var(--foreground)] mb-6 leading-[1.05]">
              Ready to build your<br />
              <span className="gradient-text-animated italic">growth engine?</span>
            </h2>
          </Reveal>
          <Reveal direction="3d" delay={0.15}>
            <p className="text-[13px] text-[var(--muted)] mb-10 max-w-lg mx-auto">
              Join 2,800+ creators who automated their content and scaled their audience — without hiring anyone.
            </p>
          </Reveal>
          <Reveal direction="scale" delay={0.3}>
            <Link href="/auth/signup" className="inline-block px-10 py-4 liquid-btn-primary text-[13px]">Get Started Free →</Link>
            <p className="text-[11px] text-[var(--muted)] mt-6">No credit card · 14 days free · Cancel anytime</p>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="py-12 px-6 lg:px-12 border-t border-[var(--lg-border)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="TheAuctus" className="w-6 h-6" />
            <span className="font-headline text-lg text-[var(--foreground)]">The<span className="accent-text">Auctus</span></span>
          </div>
          <p className="text-[11px] text-[var(--muted)]">© 2026 TheAuctus. Built by creators, for creators.</p>
          <div className="flex items-center gap-8 text-[11px] text-[var(--muted)]">
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">Terms</a>
            <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy</Link>
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
