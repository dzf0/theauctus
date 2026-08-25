"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/components/user-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useInView } from "@/hooks/use-in-view";

// ── Reveal wrapper (only fade-in-up and scale-in) ──────────────
function Reveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "scale";
  delay?: number;
}) {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const dirClass = direction === "scale" ? "reveal-scale" : "reveal";

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

// ── SVG Icons for features ──────────────────────────────────────
const icons = {
  calendar: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  globe: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  refresh: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
    </svg>
  ),
  target: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  currency: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  menu: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-4 h-4 text-[var(--muted)] transition-transform duration-300 shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  sparkles: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  bolt: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  crown: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.996.244-1.716.876-1.716 1.848v12.384c0 .972.72 1.604 1.716 1.848m7.5-10.312a7.454 7.454 0 01.982 3.172M15 4.236c.996.244 1.716.876 1.716 1.848v12.384c0 .972-.72 1.604-1.716 1.848M9.75 4.236c-.996.244-1.716.876-1.716 1.848v12.384c0 .972.72 1.604 1.716 1.848" />
    </svg>
  ),
};

// ── Data ────────────────────────────────────────────────────────
const features = [
  { icon: icons.calendar, title: "AI Content Planner", description: "Tell AI your niche and keywords. Get a 30-day content calendar with platform-specific posts, optimal timing, and hashtag strategy." },
  { icon: icons.globe, title: "Auto-Publish Everywhere", description: "Connect Twitter, LinkedIn, Instagram, TikTok, YouTube, Threads, and your blog. One click schedules across all platforms." },
  { icon: icons.chart, title: "Growth Analytics", description: "Real-time tracking of followers, engagement, reach, and revenue across every platform." },
  { icon: icons.refresh, title: "Content Repurposing", description: "One idea becomes 10 pieces. Auto-convert long-form to threads, carousels, reels, and blog posts." },
  { icon: icons.target, title: "Growth Tactics Engine", description: "AI analyzes your metrics and suggests specific, actionable growth tactics based on YOUR data." },
  { icon: icons.currency, title: "Revenue Tracking", description: "Track newsletter subscribers, affiliate revenue, and sponsorship income." },
];

import { CREDIT_PACKS, CREDIT_COSTS, CUSTOM_CREDIT_RATE, CUSTOM_CREDIT_MIN_DOLLARS } from "@/lib/constants";

// Map pack IDs to icons
const packIcons: Record<string, React.ReactNode> = {
  starter: icons.bolt,
  growth: icons.sparkles,
  pro: icons.crown,
};

const faqs = [
  { q: "How do credits work?", a: "Each AI action costs a few credits. Generating a full 30-day content calendar costs 15 credits, a single post costs 5, and repurposing costs 3. You buy credit packs and use them as you go." },
  { q: "Do credits expire?", a: "No. Credits never expire. Use them whenever you're ready to create content." },
  { q: "Can I get a refund?", a: "Yes — within 7 days of purchase if you haven't used the credits. Contact support for assistance." },
  { q: "What platforms do you support?", a: "Twitter/X, LinkedIn, Instagram, TikTok, YouTube, Threads, Facebook, and WordPress blogs. Each post is optimized for its platform." },
  { q: "How is this different from Buffer/Hootsuite?", a: "Those are scheduling tools. TheAuctus is a growth engine — it plans your content, tells you WHAT to post, and optimizes timing based on your metrics." },
];

// ── Main Page ───────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const user = useUser();

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
              <a href="#pricing" className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-foreground transition-colors link-underline">Credits</a>
              <a href="#faq" className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-foreground transition-colors link-underline">FAQ</a>
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="liquid-btn-primary text-[11px]">Dashboard</Link>
                  <button onClick={async () => { document.cookie.split(';').forEach(c => { const n = c.split('=')[0].trim(); if (n.startsWith('sb-')) document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`; }); await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {}); window.location.href = '/'; }} className="text-[11px] text-[var(--muted)] hover:text-foreground transition-colors">Sign out</button>
                </div>
              ) : (
                <Link href="/auth/signup" className="liquid-btn-primary text-[11px]">Get Started</Link>
              )}
            </div>
            <button className="md:hidden p-2 text-[var(--muted)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? icons.close : icons.menu}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--lg-border)] px-6 py-6 space-y-4" style={{ background: "var(--lg-bg-strong)", backdropFilter: "blur(40px)" }}>
            <a href="#features" className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Features</a>
            <a href="#pricing" className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Credits</a>
            <a href="#faq" className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">FAQ</a>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Theme</span>
              <ThemeToggle />
            </div>
            {user ? (
              <div className="space-y-4">
                <Link href="/dashboard" className="block liquid-btn-primary text-center text-[11px]">Dashboard</Link>
                <button onClick={async () => { document.cookie.split(';').forEach(c => { const n = c.split('=')[0].trim(); if (n.startsWith('sb-')) document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`; }); await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {}); window.location.href = '/'; }} className="block w-full text-center text-[11px] text-[var(--muted)]">Sign out</button>
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
            <div>
              <Reveal>
                <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-8">AI-Powered Content Planning</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="font-headline text-4xl sm:text-5xl lg:text-[4.5rem] leading-[1.0] text-[var(--foreground)] mb-8">
                  Schedule 30 days of content across every platform — in minutes.
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-[14px] text-[var(--muted)] leading-relaxed max-w-md mb-10">
                  TheAuctus plans your content, writes platform-specific posts, and schedules optimal timing — so you can focus on creating, not managing.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
                  {user ? (
                    <Link href="/dashboard" className="liquid-btn-primary text-[13px]">Go to Dashboard</Link>
                  ) : (
                    <Link href="/auth/signup" className="liquid-btn-primary text-[13px]">Get Started</Link>
                  )}
                </div>
                {!user && (
                  <p className="text-[12px] text-[var(--muted)]">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="accent-text hover:text-[var(--primary-light)] transition-colors">Sign in</Link>
                  </p>
                )}
              </Reveal>
              <Reveal delay={0.4}>
                <p className="text-[11px] text-[var(--muted)] mt-4">10 free credits included · No credit card required</p>
              </Reveal>
            </div>

            {/* Hero visual — simplified dashboard mockup */}
            <div className="relative flex items-center justify-center">
              <Reveal direction="scale" delay={0.3}>
                <div className="relative w-full max-w-2xl aspect-[4/3]">
                  <div className="absolute inset-0 liquid-card overflow-hidden" style={{ borderRadius: 16 }}>
                    {/* Mockup header bar */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--lg-border)" }}>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="px-4 py-1 rounded-md text-[10px] text-[var(--muted)]" style={{ background: "var(--lg-bg)" }}>
                          theauctus.in/dashboard
                        </div>
                      </div>
                    </div>
                    {/* Mockup body */}
                    <div className="p-4 flex gap-3" style={{ height: "calc(100% - 36px)" }}>
                      <div className="hidden sm:flex w-12 rounded-xl flex-col items-center gap-3 py-3" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                        <div className="w-6 h-6 rounded-md" style={{ background: "rgba(201,168,124,0.3)" }} />
                        <div className="w-5 h-5 rounded" style={{ background: "var(--lg-bg)" }} />
                        <div className="w-5 h-5 rounded" style={{ background: "var(--lg-bg)" }} />
                        <div className="w-5 h-5 rounded" style={{ background: "var(--lg-bg)" }} />
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Credits", value: "200", color: "var(--accent-copper)" },
                            { label: "Posts", value: "28", color: "var(--success)" },
                            { label: "Engagement", value: "4.8%", color: "var(--info)" },
                          ].map((stat, i) => (
                            <div key={i} className="rounded-lg p-2.5" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                              <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>{stat.label}</div>
                              <div className="font-headline text-sm" style={{ color: stat.color }}>{stat.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex-1 rounded-xl p-3" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Growth</span>
                            <span className="text-[9px]" style={{ color: "var(--success)" }}>+12.4%</span>
                          </div>
                          <div className="flex items-end gap-1 h-[60%] mt-2">
                            {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                              <div
                                key={i}
                                className="flex-1 rounded-t"
                                style={{
                                  height: `${h}%`,
                                  background: i >= 10
                                    ? "linear-gradient(180deg, rgba(201,168,124,0.6), rgba(201,168,124,0.2))"
                                    : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 rounded-lg p-2" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                            <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Next post</div>
                            <div className="text-[10px] truncate" style={{ color: "var(--foreground)" }}>10 tips for sustainable fashion...</div>
                            <div className="text-[8px] mt-0.5" style={{ color: "var(--muted)" }}>Instagram · 2:00 PM</div>
                          </div>
                          <div className="w-16 rounded-lg p-2 flex flex-col items-center justify-center" style={{ background: "rgba(201,168,124,0.1)", border: "1px solid rgba(201,168,124,0.2)" }}>
                            <div className="w-5 h-5" style={{ color: "var(--accent-copper)" }}>{icons.sparkles}</div>
                            <div className="text-[8px] mt-0.5" style={{ color: "var(--accent-copper)" }}>AI Ready</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
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
                Your content pipeline,
                <span className="text-[var(--muted)]"> fully automated.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="liquid-card p-8 h-full">
                  <div className="text-[var(--accent-copper)] mb-6">{feature.icon}</div>
                  <h3 className="font-headline text-xl text-[var(--foreground)] mb-3">{feature.title}</h3>
                  <p className="text-[13px] text-[var(--muted)] leading-relaxed">{feature.description}</p>
                </div>
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
              <Reveal key={i} delay={i * 0.1}>
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

      {/* ── Pricing (Credit Packs) ──────────────────────────── */}
      <section id="pricing" className="py-32 px-6 lg:px-12 border-t border-[var(--lg-border)]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-4">Credits</p>
              <h2 className="font-headline text-4xl sm:text-5xl text-[var(--foreground)] leading-[1.05]">
                Pay for what you use.
                <span className="text-[var(--muted)]"> No subscriptions.</span>
              </h2>
            </div>
          </Reveal>

          {/* Credit cost reference */}
          <Reveal delay={0.05}>
            <div className="liquid-card p-4 mb-12 max-w-md">
              <div className="flex items-center gap-6 text-[12px]" style={{ color: "var(--muted)" }}>
            {CREDIT_COSTS.map((item, i) => (
              <span key={i}>{item.action}: <span className="accent-text font-medium">{item.credits} cr</span></span>
            ))}
              </div>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {CREDIT_PACKS.map((pack, i) => (
              <Reveal key={pack.id} delay={i * 0.1}>
                <div className={`liquid-card p-8 h-full relative ${pack.popular ? "glow-breathe" : ""}`}>
                  {pack.popular && <span className="liquid-badge absolute top-6 right-6 z-10">Best Value</span>}
                  <div className="text-[var(--accent-copper)] mb-4">{packIcons[pack.id]}</div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-4 relative z-10">{pack.name}</p>
                  <div className="flex items-baseline gap-1 mb-1 relative z-10">
                    <span className="font-headline text-5xl text-[var(--foreground)]">${pack.price}</span>
                  </div>
                  <p className="text-[12px] text-[var(--muted)] mb-1 relative z-10">{pack.credits} credits</p>
                  <p className="text-[11px] text-[var(--muted)] mb-8 relative z-10">{pack.pricePerCredit} per credit · {pack.description}</p>
                  <ul className="space-y-3 mb-10 relative z-10">
                    {pack.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-[12px] text-[var(--cool-grey)]">
                        <span className="text-[var(--accent-copper)]">{icons.check}</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={user ? "/dashboard/billing" : "/auth/signup"} className={`block w-full text-center py-3 relative z-10 ${pack.popular ? "liquid-btn-primary" : "liquid-btn"}`}>
                    {user ? "Buy Credits" : "Start Free"}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="liquid-card p-8 mt-8 max-w-md mx-auto text-center">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-3">Or choose a custom amount</p>
              <p className="text-[13px] text-[var(--muted)] mb-4">
                Enter any amount from ${CUSTOM_CREDIT_MIN_DOLLARS}+ — credits at ${CUSTOM_CREDIT_RATE.toFixed(2)}/credit
              </p>
              <Link
                href={user ? "/dashboard/billing" : "/auth/signup"}
                className="inline-block px-6 py-2.5 liquid-btn text-[12px]"
              >
                {user ? "Choose Amount" : "Get Started"}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.35}>
            <p className="text-center mt-8 text-[12px] text-[var(--muted)]">
              All accounts start with <span className="accent-text font-medium">10 free credits</span> · No credit card required
            </p>
          </Reveal>
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
              <Reveal key={i} delay={i * 0.05}>
                <div className="border-t border-[var(--lg-border)]">
                  <button className="w-full py-5 text-left flex items-center justify-between group" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="text-[14px] text-[var(--foreground)] group-hover:text-accent-text transition-colors">{faq.q}</span>
                    <span className={`transition-transform duration-300 shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`}>{icons.chevronDown}</span>
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
          <Reveal>
            <h2 className="font-headline text-5xl sm:text-6xl text-[var(--foreground)] mb-6 leading-[1.05]">
              Ready to build your<br />
              <span className="text-[var(--muted)]">growth engine?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[13px] text-[var(--muted)] mb-10 max-w-lg mx-auto">
              Plan, write, and schedule 30 days of content across every platform — all with AI.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link href="/auth/signup" className="inline-block px-10 py-4 liquid-btn-primary text-[13px]">Get Started</Link>
            <p className="text-[11px] text-[var(--muted)] mt-6">10 free credits included · No credit card required</p>
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
          <p className="text-[11px] text-[var(--muted)]">&copy; 2026 TheAuctus. Built by creators, for creators.</p>
          <div className="flex items-center gap-8 text-[11px] text-[var(--muted)]">
            <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy</Link>
            <a href="mailto:legal@theauctus.in" className="hover:text-[var(--foreground)] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
