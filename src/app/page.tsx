"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/components/user-provider";
import {
  ScrollProgress,
  Reveal,
  useMagnetic,
  Magnetic,
} from "@/components/motion";
import { CREDIT_PACKS, CREDIT_COSTS } from "@/lib/constants";
import SpotlightCard from "@/components/SpotlightCard";
import GooeyNav from "@/components/GooeyNav";
import DepthText from "@/components/DepthText";
import AnimatedThemeToggler from "@/components/AnimatedThemeToggler";
import { useTheme } from "@/components/theme-provider";

// ── Press scale hook ───────────────────────────────────────────
function usePressScale(scale = 0.97) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onPointerDown = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `scale(${scale})`;
    el.style.transition = "transform 60ms cubic-bezier(0.2, 1.2, 0.4, 1)";
  }, [scale]);
  const onPointerUp = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
  }, []);
  return { ref, onPointerDown, onPointerUp, onPointerLeave: onPointerUp };
}

// ── SVG Icons ──────────────────────────────────────────────────
const icons = {
  calendar: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  globe: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  chart: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  refresh: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>,
  target: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  currency: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  sparkles: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
  arrowRight: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>,
  check: <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
  menu: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>,
  close: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  chevronDown: <svg className="w-4 h-4 text-[var(--muted)] transition-transform duration-300 shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>,
  scrollDown: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>,
};

// ── Data ────────────────────────────────────────────────────────
const features = [
  { icon: icons.calendar, title: "AI Content Planner", description: "Tell AI your niche. Get a 30-day calendar with platform-specific posts, optimal timing, and hashtags.", span: 2 },
  { icon: icons.globe, title: "Auto-Publish Everywhere", description: "Twitter, LinkedIn, Instagram, TikTok, YouTube — one click schedules across all platforms.", span: 1 },
  { icon: icons.chart, title: "Growth Analytics", description: "Real-time tracking of followers, engagement, reach, and revenue across every platform.", span: 1 },
  { icon: icons.refresh, title: "Content Repurposing", description: "One idea becomes 10 pieces. Auto-convert long-form to threads, carousels, reels, and blog posts.", span: 1 },
  { icon: icons.target, title: "Growth Tactics Engine", description: "AI analyzes your metrics and suggests specific, actionable growth tactics based on YOUR data.", span: 1 },
  { icon: icons.currency, title: "Revenue Tracking", description: "Track newsletter subscribers, affiliate revenue, and sponsorship income — all in one dashboard.", span: 1 },
];

const faqs = [
  { q: "How do credits work?", a: "Each AI action costs a few credits. A 30-day calendar costs 15, a single post costs 5, and repurposing costs 3." },
  { q: "Do credits expire?", a: "No. Credits never expire. Use them whenever you're ready." },
  { q: "What platforms do you support?", a: "Twitter/X, LinkedIn, Instagram, TikTok, YouTube, Threads, Facebook, and WordPress blogs." },
  { q: "How is this different from Buffer/Hootsuite?", a: "Those are scheduling tools. TheAuctus is a growth engine — it plans, writes, and optimizes based on your metrics." },
];

// ── Main Page ───────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const user = useUser();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const heroCta = usePressScale(0.96);
  const finalCta = usePressScale(0.96);
  const heroMagnetic = useMagnetic(8);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen relative">
      <ScrollProgress />

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 liquid-glass-strong nav-scroll-edge ${navScrolled ? "nav-scrolled" : ""}`} style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="TheAuctus" className="w-8 h-8" />
              <span className="font-headline text-xl tracking-tight text-foreground">The<span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)' }}>Auctus</span></span>
            </div>
            <div className="hidden md:flex items-center gap-10">
              <GooeyNav
                items={[
                  { label: "Features", href: "#features" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Credits", href: "#pricing" },
                  { label: "FAQ", href: "#faq" },
                ]}
                particleCount={12}
                particleDistances={[70, 8]}
                particleR={80}
                animationTime={500}
                timeVariance={200}
                colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              />
              <span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }}><AnimatedThemeToggler /></span>
              {user ? (
                <Link href="/dashboard" className="liquid-btn-primary text-[11px]">Dashboard</Link>
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
          <div className="md:hidden border-t border-[var(--lg-border)] px-6 py-4 space-y-1 animate-fade-in-down" style={{ background: "var(--lg-bg-strong)", backdropFilter: "blur(40px)" }}>
            <a href="#features" className="block py-3 px-3 text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--foreground)] rounded-lg transition-colors" style={{ background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Features</a>
            <a href="#how-it-works" className="block py-3 px-3 text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--foreground)] rounded-lg transition-colors" style={{ background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>How It Works</a>
            <a href="#pricing" className="block py-3 px-3 text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--foreground)] rounded-lg transition-colors" style={{ background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Credits</a>
            <a href="#faq" className="block py-3 px-3 text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--foreground)] rounded-lg transition-colors" style={{ background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>FAQ</a>
            <div className="px-3 py-2">
              <AnimatedThemeToggler className="text-[var(--foreground)]" />
            </div>
            {user ? (
              <Link href="/dashboard" className="block liquid-btn-primary text-center text-[13px] py-3">Dashboard</Link>
            ) : (
              <Link href="/auth/signup" className="block liquid-btn-primary text-center text-[13px] py-3">Get Started</Link>
            )}
          </div>
        )}
      </nav>

      {/* ── Hero — Full immersive section ────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        <div className="max-w-7xl mx-auto w-full relative z-10 px-5 sm:px-6 lg:px-12 pt-28 sm:pt-32 lg:pt-40 pb-16 text-center">
          <Reveal>
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="accent-line-animate" style={{ "--line-delay": "0.2s" } as React.CSSProperties} />
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>AI-Powered Content Planning</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mb-8 flex flex-col items-center w-full">
              <DepthText
                text="Schedule 30"
                layers={24}
                depth={1.8}
                faceColor={isDark ? "#f8fafc" : "#1d1d1f"}
                depthColor={isDark ? "#86868b" : "#b0b0b5"}
                tilt={6}
                pointerTracking
                smoothing={0.14}
                perspective={1000}
                fontSize="clamp(2.2rem, 7vw, 5rem)"
                fontWeight={400}
                shadow
              />
              <DepthText
                text="days of content"
                layers={24}
                depth={1.8}
                faceColor={isDark ? "#f8fafc" : "#1d1d1f"}
                depthColor={isDark ? "#86868b" : "#b0b0b5"}
                tilt={6}
                pointerTracking
                smoothing={0.14}
                perspective={1000}
                fontSize="clamp(2.2rem, 7vw, 5rem)"
                fontWeight={400}
                shadow
              />
              <DepthText
                text="across every platform"
                layers={24}
                depth={1.8}
                faceColor={isDark ? "#f8fafc" : "#1d1d1f"}
                depthColor={isDark ? "#86868b" : "#b0b0b5"}
                tilt={6}
                pointerTracking
                smoothing={0.14}
                perspective={1000}
                fontSize="clamp(2.2rem, 7vw, 5rem)"
                fontWeight={400}
                shadow
              />
              <p className="font-headline text-[2rem] sm:text-5xl lg:text-[4.5rem] xl:text-[5rem] leading-[0.92] tracking-tight text-[var(--muted)] mt-2">
                — in minutes.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[15px] text-[var(--muted)] leading-relaxed max-w-lg mx-auto mb-10">
              Plan, write, and schedule a full month of platform-specific content — all with AI. Focus on creating, not managing.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
              {user ? (
                <Link href="/dashboard" className="liquid-btn-primary text-[13px] cta-glow w-full sm:w-auto text-center">Go to Dashboard {icons.arrowRight}</Link>
              ) : (
                <Magnetic strength={6}>
                  <Link href="/auth/signup" ref={heroCta.ref} onPointerDown={heroCta.onPointerDown} onPointerUp={heroCta.onPointerUp} onPointerLeave={heroCta.onPointerLeave} onMouseMove={heroMagnetic.onMouseMove} onMouseLeave={heroMagnetic.onMouseLeave} className="liquid-btn-primary text-[13px] cta-glow w-full sm:w-auto text-center inline-flex items-center gap-2">
                    Get Started Free {icons.arrowRight}
                  </Link>
                </Magnetic>
              )}
            </div>
            <div className="flex items-center justify-center gap-6">
              <p className="text-[12px] text-[var(--muted)]">10 free credits</p>
              <span className="w-1 h-1 rounded-full bg-[var(--muted)]" />
              <p className="text-[12px] text-[var(--muted)]">No credit card</p>
            </div>
          </Reveal>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[var(--muted)] scroll-hint">
          <span className="text-[9px] uppercase tracking-[0.15em]">Scroll</span>
          {icons.scrollDown}
        </div>
      </section>

      {/* ── Features — Bento Grid ────────────────────────────── */}
      <section id="features" className="py-24 sm:py-32 lg:py-40 px-5 sm:px-6 lg:px-12 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <div className="mb-16 lg:mb-24">
              <p className="text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>The Engine</p>
              <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-[var(--foreground)] max-w-3xl leading-[1.0]">
                Your content pipeline,<br />
                <span className="text-[var(--muted)]">fully automated.</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <SpotlightCard key={i} className={`${f.span === 2 ? 'sm:col-span-2' : ''}`} spotlightColor="rgba(255,255,255,0.06)">
                  <div className="mb-5 icon-pulse" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)' }}>{f.icon}</div>
                  <h3 className="font-headline text-xl sm:text-2xl text-[var(--foreground)] mb-3">{f.title}</h3>
                  <p className="text-[13px] text-[var(--muted)] leading-relaxed">{f.description}</p>
                </SpotlightCard>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section id="how-it-works" className="py-24 sm:py-32 lg:py-40 px-5 sm:px-6 lg:px-12 relative shimmer-divider">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="mb-16 lg:mb-24">
              <p className="text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>Process</p>
              <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-[var(--foreground)] leading-[1.0]">
                From zero to 30 days of content.<br />
                <span className="text-[var(--muted)]">Three steps.</span>
              </h2>
            </div>
          </Reveal>

          <div className="space-y-12 lg:space-y-20">
            {[
              { step: "01", title: "Tell AI about your brand", desc: "Enter your niche, keywords, and brand voice. Connect your platforms. Takes 2 minutes.", visual: (
                <SpotlightCard className="p-6" spotlightColor="rgba(255,255,255,0.05)">
                  <div className="space-y-3">
                    {[1, 0.7, 0.5].map((w, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)') : 'var(--lg-border)' }} />
                        <div className="h-2 rounded-full" style={{ width: `${w * 100}%`, background: i === 0 ? (isDark ? 'linear-gradient(90deg, rgba(255,255,255,0.3), transparent)' : 'linear-gradient(90deg, rgba(0,0,0,0.2), transparent)') : 'var(--lg-bg)' }} />
                      </div>
                    ))}
                    <p className="text-[9px] text-[var(--muted)] uppercase tracking-wider pt-2">Brand voice loaded</p>
                  </div>
                </SpotlightCard>
              )},
              { step: "02", title: "Review your calendar", desc: "AI generates 30+ platform-specific posts with optimal timing and hashtags.", visual: (
                <SpotlightCard className="p-6" spotlightColor="rgba(255,255,255,0.05)">
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: 21 }, (_, i) => (
                      <div key={i} className="aspect-square rounded-sm" style={{ background: i < 5 ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'var(--lg-bg)', border: i === 10 ? (isDark ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(0,0,0,0.2)') : '1px solid var(--lg-border)' }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider">30 posts ready</span>
                    <span className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)' }}>✓</span>
                  </div>
                </SpotlightCard>
              )},
              { step: "03", title: "Watch it grow", desc: "Content auto-publishes. Analytics track everything. AI suggests new tactics weekly.", visual: (
                <SpotlightCard className="p-6" spotlightColor="rgba(255,255,255,0.05)">
                  <div className="flex items-end gap-1 h-20">
                    {[25, 30, 28, 40, 45, 38, 55, 50, 65, 70, 68, 85, 80, 95].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i >= 10 ? (isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))' : 'linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05)') : 'var(--lg-bg)' }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider">Growth +4.2x</span>
                    <span className="text-[9px]" style={{ color: 'var(--success)' }}>↑ Trending</span>
                  </div>
                </SpotlightCard>
              )},
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)' }}>
                        <span className="font-headline text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }}>{s.step}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">Step {s.step}</span>
                    </div>
                    <h3 className="font-headline text-2xl sm:text-3xl text-[var(--foreground)] mb-4">{s.title}</h3>
                    <p className="text-[14px] text-[var(--muted)] leading-relaxed">{s.desc}</p>
                  </div>
                  <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                    {s.visual}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="py-24 sm:py-32 lg:py-40 px-5 sm:px-6 lg:px-12 shimmer-divider relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{ background: isDark ? 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)' : 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <div className="mb-12">
              <p className="text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>Credits</p>
              <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-[var(--foreground)] leading-[1.0]">
                Pay for what you use.<br />
                <span className="text-[var(--muted)]">No subscriptions.</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <SpotlightCard className="p-4 mb-10 max-w-full sm:max-w-md" spotlightColor="rgba(255,255,255,0.04)">
              <div className="flex flex-wrap gap-x-4 gap-y-1 sm:gap-x-6 text-[12px]" style={{ color: 'var(--muted)' }}>
                {CREDIT_COSTS.map((item, i) => (
                  <span key={i}>{item.action}:            <span className="font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>{item.credits} cr</span></span>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CREDIT_PACKS.map((pack) => (
                <SpotlightCard key={pack.id} className={`p-6 sm:p-8 relative ${pack.popular ? 'glow-breathe' : ''}`} spotlightColor="rgba(255,255,255,0.06)">
                  {pack.popular && <span className="liquid-badge absolute top-5 right-5 z-10">Best Value</span>}
                  <div className="mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)' }}>{pack.id === 'starter' ? icons.sparkles : pack.id === 'growth' ? icons.calendar : icons.currency}</div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-4 relative z-10">{pack.name}</p>
                  <div className="flex items-baseline gap-1 mb-1 relative z-10">
                    <span className="font-headline text-4xl sm:text-5xl text-[var(--foreground)]">${pack.price}</span>
                  </div>
                  <p className="text-[12px] text-[var(--muted)] mb-1 relative z-10">{pack.credits} credits</p>
                  <p className="text-[11px] text-[var(--muted)] mb-8 relative z-10">{pack.pricePerCredit}/credit · {pack.description}</p>
                  <ul className="space-y-3 mb-8 relative z-10">
                    {pack.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-[12px] text-[var(--cool-grey)]">
                        <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)' }}>{icons.check}</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={user ? '/billing' : '/auth/signup'} className={`block w-full text-center py-3 relative z-10 ${pack.popular ? 'liquid-btn-primary' : 'liquid-btn'}`}>
                    {user ? 'Buy Credits' : 'Start Free'}
                  </Link>
                </SpotlightCard>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-center mt-10 text-[12px] text-[var(--muted)]">
              All accounts start with <span className="font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>10 free credits</span> · No credit card required
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className="py-24 sm:py-32 lg:py-40 px-5 sm:px-6 lg:px-12 shimmer-divider">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="mb-12 lg:mb-16">
              <p className="text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>FAQ</p>
              <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-[var(--foreground)]">Questions? Answered.</h2>
            </div>
          </Reveal>
          <div>
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="border-t border-[var(--lg-border)]">
                  <button className="w-full py-5 text-left flex items-center justify-between group min-h-[44px]" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="text-[14px] text-[var(--foreground)] transition-colors pr-4" style={{ '--hover-color': isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>{faq.q}</span>
                    <span className="transition-transform duration-300 shrink-0" style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>{icons.chevronDown}</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-400 ${openFaq === i ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`} style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
                    <p className="text-[13px] text-[var(--muted)] leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="py-24 sm:py-32 lg:py-40 px-5 sm:px-6 lg:px-12 shimmer-divider relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-[var(--foreground)] mb-6 leading-[1.0]">
              Ready to build your<br />growth engine?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[14px] text-[var(--muted)] mb-10 max-w-lg mx-auto">
              Plan, write, and schedule 30 days of content across every platform — all with AI.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Magnetic strength={8}>
              <Link href="/auth/signup" ref={finalCta.ref} onPointerDown={finalCta.onPointerDown} onPointerUp={finalCta.onPointerUp} onPointerLeave={finalCta.onPointerLeave} onMouseMove={heroMagnetic.onMouseMove} onMouseLeave={heroMagnetic.onMouseLeave} className="inline-block px-10 py-4 liquid-btn-primary text-[13px] cta-glow">
                Get Started Free {icons.arrowRight}
              </Link>
            </Magnetic>
            <p className="text-[11px] text-[var(--muted)] mt-6">10 free credits included · No credit card required</p>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="relative z-10 py-12 px-6 lg:px-12 border-t border-[var(--lg-border)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="TheAuctus" className="w-6 h-6" />
            <span className="font-headline text-lg text-[var(--foreground)]">The<span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)' }}>Auctus</span></span>
          </div>
          <p className="text-[11px] text-[var(--muted)]">&copy; 2026 TheAuctus. Built by creators, for creators.</p>
          <div className="flex items-center gap-8 text-[11px] text-[var(--muted)]">
            <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
