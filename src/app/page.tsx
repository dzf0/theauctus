"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/components/user-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ScrollProgress,
  Reveal,
  WordReveal,
  useMagnetic,
  Magnetic,
  TiltCard,
} from "@/components/motion";
import { CREDIT_PACKS, CREDIT_COSTS, CUSTOM_CREDIT_RATE, CUSTOM_CREDIT_MIN_DOLLARS } from "@/lib/constants";
import Galaxy from "@/components/galaxy/Galaxy";
import CursorFollower from "@/components/cursor/CursorFollower";

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

// ── Live Product Mockup ──────────────────────────────────────────
function ProductMockup() {
  const [activeDay, setActiveDay] = useState(0);
  const [typed, setTyped] = useState("");
  const fullText = "Create a 30-day fitness content calendar";

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(t);
    }, 40);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveDay((d) => (d + 1) % 12);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const platforms = ["𝕏", "in", "📷", "♪", "▶", "@"];
  const days = Array.from({ length: 12 }, (_, i) => ({
    platform: platforms[i % 6],
    color: ["rgba(255,255,255,0.08)", "rgba(10,102,194,0.12)", "rgba(225,48,108,0.1)", "rgba(255,0,80,0.1)", "rgba(255,0,0,0.1)", "rgba(255,255,255,0.1)"][i % 6],
  }));

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Floating rings */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-[rgba(255,255,255,0.06)] hero-gradient-ring" />
      <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full border border-[rgba(255,255,255,0.04)] hero-gradient-ring" style={{ animationDelay: '3s' }} />

      {/* Main card */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--lg-bg-strong)', border: '1px solid var(--lg-border)', boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(255,255,255,0.03)' }}>
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid var(--lg-border)', background: 'var(--lg-bg)' }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md text-[10px] text-[var(--muted)]" style={{ background: 'var(--lg-bg)' }}>theauctus.in/planner</div>
          </div>
        </div>

        {/* AI prompt bar */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--lg-border)' }}>
          <div className="flex items-center gap-2 mb-3">              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <span className="text-white/60 text-[9px]">✦</span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">AI Planner</span>
          </div>
          <p className="text-[13px] text-[var(--foreground)] font-headline min-h-[20px]">
            {typed}
            <span className="inline-block w-[2px] h-4 bg-white/60 ml-0.5 align-text-bottom" style={{ animation: 'blink-cursor 1s step-end infinite' }} />
          </p>
        </div>

        {/* Calendar grid */}
        <div className="p-5">
          <div className="grid grid-cols-6 gap-2">
            {days.map((d, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg flex items-center justify-center text-[11px] transition-all duration-500"
                style={{
                  background: i === activeDay ? 'rgba(255,255,255,0.15)' : d.color,
                  border: `1px solid ${i === activeDay ? 'rgba(255,255,255,0.3)' : 'var(--lg-border)'}`,
                  transform: i === activeDay ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: i === activeDay ? '0 0 16px rgba(255,255,255,0.1)' : 'none',
                }}
              >
                {d.platform}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider">30 posts scheduled</span>
            <span className="text-[10px] text-white/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" style={{ animation: 'blink-cursor 2s ease-in-out infinite' }} />
              Publishing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Seeded pseudo-random (deterministic for SSR hydration) ──
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ── Floating Parallax Particles ──────────────────────────────
function ParallaxField() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 7 + 1) * 100,
      y: seededRandom(i * 13 + 2) * 100,
      size: 1 + seededRandom(i * 19 + 3) * 3,
      depth: 0.2 + seededRandom(i * 23 + 4) * 0.8,
      opacity: 0.1 + seededRandom(i * 29 + 5) * 0.4,
      duration: 4 + seededRandom(i * 31 + 6) * 8,
      delay: seededRandom(i * 37 + 7) * 4,
    }))
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMouse({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 mobile-hide-bg">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            background: "rgba(255,255,255,0.5)",
            transform: `translate(${mouse.x * p.depth * 30}px, ${mouse.y * p.depth * 30}px)`,
            transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Floating Orbit Rings ────────────────────────────────────
function OrbitRings() {
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 mobile-hide-bg">
      {[120, 200, 280].map((size, i) => (
        <div
          key={i}
          className="absolute rounded-full border hidden sm:block"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderColor: `rgba(255,255,255,${0.08 - i * 0.02})`,
            animation: `orbit-spin ${20 + i * 10}s linear infinite ${i % 2 === 0 ? "" : "reverse"}`,
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: "6px",
              height: "6px",
              background: "rgba(255,255,255,0.4)",
              top: "-3px",
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: "0 0 8px rgba(255,255,255,0.3)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const user = useUser();
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
      <CursorFollower />
      <ScrollProgress />

      {/* ── Fixed full-page background layers (matching 404) ── */}
      <div className="fixed inset-0 z-0 mobile-hide-bg">
        <Galaxy
          saturation={0}
          density={0.8}
          glowIntensity={0.4}
          starSpeed={0.4}
          mouseRepulsion={true}
          repulsionStrength={2}
          twinkleIntensity={0.3}
          rotationSpeed={0.03}
          speed={0.6}
          transparent={true}
        />
      </div>
      <ParallaxField />
      <OrbitRings />
      <div className="noise-overlay" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      {/* Radial gradient backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 liquid-glass-strong nav-scroll-edge ${navScrolled ? "nav-scrolled" : ""}`} style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="TheAuctus" className="w-8 h-8" />
              <span className="font-headline text-xl tracking-tight text-foreground">The<span className="text-white/70">Auctus</span></span>
            </div>
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-foreground transition-colors link-underline">Features</a>
              <a href="#how-it-works" className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-foreground transition-colors link-underline">How It Works</a>
              <a href="#pricing" className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-foreground transition-colors link-underline">Credits</a>
              <a href="#faq" className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-foreground transition-colors link-underline">FAQ</a>
              <ThemeToggle />
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
            <a href="#features" className="block py-3 px-3 text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--foreground)] hover:bg-white/5 rounded-lg transition-colors">Features</a>
            <a href="#how-it-works" className="block py-3 px-3 text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--foreground)] hover:bg-white/5 rounded-lg transition-colors">How It Works</a>
            <a href="#pricing" className="block py-3 px-3 text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--foreground)] hover:bg-white/5 rounded-lg transition-colors">Credits</a>
            <a href="#faq" className="block py-3 px-3 text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--foreground)] hover:bg-white/5 rounded-lg transition-colors">FAQ</a>
            <div className="flex items-center gap-2 py-3 px-3">
              <span className="text-[13px] uppercase tracking-[0.1em] text-[var(--foreground)]">Theme</span>
              <ThemeToggle />
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

        <div className="max-w-7xl mx-auto w-full relative z-10 px-5 sm:px-6 lg:px-12 pt-28 sm:pt-32 lg:pt-40 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text */}
            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-8">
                  <span className="accent-line-animate" style={{ "--line-delay": "0.2s" } as React.CSSProperties} />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">AI-Powered Content Planning</p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="font-headline text-[2.8rem] sm:text-6xl lg:text-[5rem] xl:text-[5.5rem] leading-[0.92] tracking-tight text-[var(--foreground)] mb-8">
                  <span className="block">Schedule 30</span>
                  <span className="block">days of content</span>
                  <span className="block">across <span className="stat-number">every</span> platform</span>
                  <span className="block text-[var(--muted)]">— in minutes.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-[15px] text-[var(--muted)] leading-relaxed max-w-lg mb-10">
                  Plan, write, and schedule a full month of platform-specific content — all with AI. Focus on creating, not managing.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-6">
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
                <div className="flex items-center gap-6">
                  <p className="text-[12px] text-[var(--muted)]">10 free credits</p>
                  <span className="w-1 h-1 rounded-full bg-[var(--muted)]" />
                  <p className="text-[12px] text-[var(--muted)]">No credit card</p>
                </div>
              </Reveal>
            </div>

            {/* Right — Live product mockup */}
            <div className="hidden lg:block">
              <Reveal variant="zoom" delay={0.3}>
                <ProductMockup />
              </Reveal>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1 text-[var(--muted)] scroll-hint">
          <span className="text-[9px] uppercase tracking-[0.15em]">Scroll</span>
          {icons.scrollDown}
        </div>
      </section>

      {/* ── Features — Bento Grid ────────────────────────────── */}
      <section id="features" className="py-24 sm:py-32 lg:py-40 px-5 sm:px-6 lg:px-12 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <div className="mb-16 lg:mb-24">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-4">The Engine</p>
              <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-[var(--foreground)] max-w-3xl leading-[1.0]">
                Your content pipeline,<br />
                <span className="text-[var(--muted)]">fully automated.</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="bento-grid">
              {features.map((f, i) => (
                <div key={i} className={`bento-card ${f.span === 2 ? 'bento-card-span-2' : ''}`}>
                  <div className="bento-glow" />
                  <div className="text-white/60 mb-5 icon-pulse">{f.icon}</div>
                  <h3 className="font-headline text-xl sm:text-2xl text-[var(--foreground)] mb-3">{f.title}</h3>
                  <p className="text-[13px] text-[var(--muted)] leading-relaxed">{f.description}</p>
                </div>
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-4">Process</p>
              <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-[var(--foreground)] leading-[1.0]">
                From zero to 30 days of content.<br />
                <span className="text-[var(--muted)]">Three steps.</span>
              </h2>
            </div>
          </Reveal>

          <div className="space-y-12 lg:space-y-20">
            {[
              { step: "01", title: "Tell AI about your brand", desc: "Enter your niche, keywords, and brand voice. Connect your platforms. Takes 2 minutes.", visual: (
                <div className="liquid-card p-6 rounded-xl">
                  <div className="space-y-3">
                    {[1, 0.7, 0.5].map((w, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? 'rgba(255,255,255,0.6)' : 'var(--lg-border)' }} />
                        <div className="h-2 rounded-full" style={{ width: `${w * 100}%`, background: i === 0 ? 'linear-gradient(90deg, rgba(255,255,255,0.3), transparent)' : 'var(--lg-bg)' }} />
                      </div>
                    ))}
                    <p className="text-[9px] text-[var(--muted)] uppercase tracking-wider pt-2">Brand voice loaded</p>
                  </div>
                </div>
              )},
              { step: "02", title: "Review your calendar", desc: "AI generates 30+ platform-specific posts with optimal timing and hashtags.", visual: (
                <div className="liquid-card p-6 rounded-xl">
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: 21 }, (_, i) => (
                      <div key={i} className="aspect-square rounded-sm" style={{ background: i < 5 ? 'rgba(255,255,255,0.1)' : 'var(--lg-bg)', border: i === 10 ? '1px solid rgba(255,255,255,0.4)' : '1px solid var(--lg-border)' }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider">30 posts ready</span>
                    <span className="text-[9px] text-white/60">✓</span>
                  </div>
                </div>
              )},
              { step: "03", title: "Watch it grow", desc: "Content auto-publishes. Analytics track everything. AI suggests new tactics weekly.", visual: (
                <div className="liquid-card p-6 rounded-xl">
                  <div className="flex items-end gap-1 h-20">
                    {[25, 30, 28, 40, 45, 38, 55, 50, 65, 70, 68, 85, 80, 95].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i >= 10 ? 'linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))' : 'var(--lg-bg)' }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider">Growth +4.2x</span>
                    <span className="text-[9px]" style={{ color: 'var(--success)' }}>↑ Trending</span>
                  </div>
                </div>
              )},
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span className="font-headline text-sm text-white/70">{s.step}</span>
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <div className="mb-12">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-4">Credits</p>
              <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-[var(--foreground)] leading-[1.0]">
                Pay for what you use.<br />
                <span className="text-[var(--muted)]">No subscriptions.</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="liquid-card p-4 mb-10 max-w-full sm:max-w-md rounded-xl">
              <div className="flex flex-wrap gap-x-4 gap-y-1 sm:gap-x-6 text-[12px]" style={{ color: 'var(--muted)' }}>
                {CREDIT_COSTS.map((item, i) => (
                  <span key={i}>{item.action}: <span className="text-white/70 font-medium">{item.credits} cr</span></span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CREDIT_PACKS.map((pack) => (
                <TiltCard key={pack.id} maxTilt={3} className={`liquid-card p-6 sm:p-8 relative hover-lift ${pack.popular ? 'glow-breathe' : ''}`} style={{ borderRadius: 'var(--lg-radius-sm)' }}>
                  {pack.popular && <span className="liquid-badge absolute top-5 right-5 z-10">Best Value</span>}
                  <div className="text-white/60 mb-4">{pack.id === 'starter' ? icons.sparkles : pack.id === 'growth' ? icons.calendar : icons.currency}</div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-4 relative z-10">{pack.name}</p>
                  <div className="flex items-baseline gap-1 mb-1 relative z-10">
                    <span className="font-headline text-4xl sm:text-5xl text-[var(--foreground)]">${pack.price}</span>
                  </div>
                  <p className="text-[12px] text-[var(--muted)] mb-1 relative z-10">{pack.credits} credits</p>
                  <p className="text-[11px] text-[var(--muted)] mb-8 relative z-10">{pack.pricePerCredit}/credit · {pack.description}</p>
                  <ul className="space-y-3 mb-8 relative z-10">
                    {pack.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-[12px] text-[var(--cool-grey)]">
                        <span className="text-white/60">{icons.check}</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={user ? '/billing' : '/auth/signup'} className={`block w-full text-center py-3 relative z-10 ${pack.popular ? 'liquid-btn-primary' : 'liquid-btn'}`}>
                    {user ? 'Buy Credits' : 'Start Free'}
                  </Link>
                </TiltCard>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-center mt-10 text-[12px] text-[var(--muted)]">
              All accounts start with <span className="text-white/70 font-medium">10 free credits</span> · No credit card required
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className="py-24 sm:py-32 lg:py-40 px-5 sm:px-6 lg:px-12 shimmer-divider">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="mb-12 lg:mb-16">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-4">FAQ</p>
              <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-[var(--foreground)]">Questions? Answered.</h2>
            </div>
          </Reveal>
          <div>
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="border-t border-[var(--lg-border)]">
                  <button className="w-full py-5 text-left flex items-center justify-between group min-h-[44px]" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="text-[14px] text-[var(--foreground)] group-hover:text-white/70 transition-colors pr-4">{faq.q}</span>
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
      <footer className="py-12 px-6 lg:px-12 border-t border-[var(--lg-border)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="TheAuctus" className="w-6 h-6" />
            <span className="font-headline text-lg text-[var(--foreground)]">The<span className="text-white/70">Auctus</span></span>
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
