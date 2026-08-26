import type { Metadata } from "next";
import Link from "next/link";
import { ScrollProgress, Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Contact — TheAuctus",
  description: "Get in touch with TheAuctus. Reach our team for business inquiries, customer support, or legal matters.",
};

const contactChannels = [
  {
    label: "Business",
    email: "team@theauctus.in",
    description: "Partnerships, press, and business development",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    color: "var(--accent-copper)",
  },
  {
    label: "Customer Support",
    email: "support@theauctus.in",
    description: "Help with your account, credits, or technical issues",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
    color: "var(--info)",
  },
  {
    label: "Legal",
    email: "legal@theauctus.in",
    description: "Privacy concerns, terms, and compliance",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.589-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.589-1.202L5.25 4.971z" />
      </svg>
    ),
    color: "var(--success)",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <ScrollProgress />

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 liquid-glass-strong nav-scroll-edge" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/">
                <img src="/logo.svg" alt="TheAuctus" className="w-8 h-8" />
              </Link>
              <span className="font-headline text-xl tracking-tight text-foreground">
                The<span className="accent-text">Auctus</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-10">
              <Link href="/" className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-foreground transition-colors link-underline">Home</Link>
              <Link href="/auth/signup" className="liquid-btn-primary text-[11px]">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative pt-32 sm:pt-40 lg:pt-48 pb-16 sm:pb-20 px-5 sm:px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(201,168,124,0.08) 0%, transparent 60%)", filter: "blur(80px)" }} />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(124,158,201,0.05) 0%, transparent 60%)", filter: "blur(60px)" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="accent-line-animate" style={{ "--line-delay": "0.2s" } as React.CSSProperties} />
              <p className="text-[10px] uppercase tracking-[0.2em] accent-text">Contact</p>
              <span className="accent-line-animate" style={{ "--line-delay": "0.3s", animationDirection: "reverse" } as React.CSSProperties} />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-7xl text-[var(--foreground)] leading-[1.0] mb-6">
              Get in touch.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[14px] sm:text-[16px] text-[var(--muted)] leading-relaxed max-w-xl mx-auto">
              We&apos;d love to hear from you. Choose the channel that fits your needs — we typically respond within 24 hours.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Contact Channels ────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 px-5 sm:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <Reveal variant="stagger" className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {contactChannels.map((channel, i) => (
              <a
                key={i}
                href={`mailto:${channel.email}`}
                className="liquid-card p-6 sm:p-8 text-center hover-lift group block"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110" style={{ background: `color-mix(in srgb, ${channel.color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${channel.color} 20%, transparent)` }}>
                  <div style={{ color: channel.color }}>{channel.icon}</div>
                </div>
                <h3 className="font-headline text-xl text-[var(--foreground)] mb-2">{channel.label}</h3>
                <p className="text-[12px] text-[var(--muted)] mb-4 leading-relaxed">{channel.description}</p>
                <span className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors duration-200" style={{ color: channel.color }}>
                  {channel.email}
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </a>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Additional Info ─────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-5 sm:px-6 lg:px-12 shimmer-divider">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-[var(--foreground)] mb-4">
              Response times
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-10">
              {[
                { label: "Business", time: "1–2 business days", note: "Mon–Fri" },
                { label: "Support", time: "Under 24 hours", note: "Every day" },
                { label: "Legal", time: "3–5 business days", note: "Mon–Fri" },
              ].map((item, i) => (
                <div key={i} className="liquid-card p-5">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-2">{item.label}</p>
                  <p className="font-headline text-xl text-[var(--foreground)]">{item.time}</p>
                  <p className="text-[11px] text-[var(--muted)] mt-1">{item.note}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-5 sm:px-6 lg:px-12 shimmer-divider">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-[var(--foreground)] mb-10 text-center">
              Common questions
            </h2>
          </Reveal>
          <div className="space-y-4">
            {[
              { q: "I need help with my account. What should I do?", a: "Email support@theauctus.in with your registered email address and a description of the issue. We'll get back to you within 24 hours." },
              { q: "I want to partner or integrate with TheAuctus.", a: "Reach out to team@theauctus.in with a brief overview of your proposal. We're always open to exploring partnerships that benefit our creators." },
              { q: "How do I request my data or delete my account?", a: "Contact legal@theauctus.in for data requests, account deletion, or privacy-related inquiries. We comply with GDPR and other applicable regulations." },
            ].map((faq, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="liquid-card p-5 sm:p-6">
                  <h3 className="text-[13px] sm:text-[14px] font-medium text-[var(--foreground)] mb-2">{faq.q}</h3>
                  <p className="text-[12px] text-[var(--muted)] leading-relaxed">{faq.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
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
            <Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
