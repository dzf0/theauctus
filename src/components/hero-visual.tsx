"use client";

import { ThreeDCard } from "@/components/three-d-card";

export function HeroVisual() {
  return (
    <div className="relative w-full max-w-2xl aspect-[4/3]">
      {/* ── Animated gradient orbs ─────────────────────────── */}
      <div
        className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full animate-float-slow"
        style={{
          background: "radial-gradient(circle, rgba(201,168,124,0.12) 0%, rgba(201,168,124,0.04) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full animate-float-medium"
        style={{
          background: "radial-gradient(circle, rgba(124,158,201,0.08) 0%, transparent 60%)",
          filter: "blur(50px)",
          animationDelay: "1s",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(201,168,124,0.06) 0%, transparent 60%)",
          filter: "blur(40px)",
          animation: "pulse-glow 4s ease-in-out infinite",
        }}
      />

      {/* ── Dashboard mockup (main visual) ─────────────────── */}
      <ThreeDCard intensity={6} className="absolute inset-0 liquid-card overflow-hidden" style={{ borderRadius: 16 }}>
        {/* Mockup header bar */}
        <div className="relative z-10 flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--lg-border)" }}>
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
        <div className="relative z-10 p-4 flex gap-3" style={{ height: "calc(100% - 40px)" }}>
          {/* Mini sidebar */}
          <div className="w-12 rounded-xl flex flex-col items-center gap-3 py-3" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
            <div className="w-6 h-6 rounded-md" style={{ background: "rgba(201,168,124,0.3)" }} />
            <div className="w-5 h-5 rounded" style={{ background: "var(--lg-bg)" }} />
            <div className="w-5 h-5 rounded" style={{ background: "var(--lg-bg)" }} />
            <div className="w-5 h-5 rounded" style={{ background: "var(--lg-bg)" }} />
            <div className="mt-auto w-5 h-5 rounded" style={{ background: "var(--lg-bg)" }} />
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Credits", value: "42", color: "var(--accent-copper)" },
                { label: "Posts", value: "28", color: "var(--success)" },
                { label: "Engagement", value: "4.8%", color: "var(--info)" },
              ].map((stat, i) => (
                <div key={i} className="rounded-lg p-2.5" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                  <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>{stat.label}</div>
                  <div className="font-headline text-sm" style={{ color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div className="flex-1 rounded-xl p-3" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Growth</span>
                <span className="text-[9px]" style={{ color: "var(--success)" }}>+12.4%</span>
              </div>
              {/* Fake chart bars */}
              <div className="flex items-end gap-1 h-[60%] mt-2">
                {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all"
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

            {/* Bottom row */}
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg p-2" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Next post</div>
                <div className="text-[10px] truncate" style={{ color: "var(--foreground)" }}>10 tips for sustainable fashion...</div>
                <div className="text-[8px] mt-0.5" style={{ color: "var(--muted)" }}>Instagram · 2:00 PM</div>
              </div>
              <div className="w-16 rounded-lg p-2 flex flex-col items-center justify-center" style={{ background: "rgba(201,168,124,0.1)", border: "1px solid rgba(201,168,124,0.2)" }}>
                <div className="text-[14px]">✨</div>
                <div className="text-[8px] mt-0.5" style={{ color: "var(--accent-copper)" }}>AI Ready</div>
              </div>
            </div>
          </div>
        </div>
      </ThreeDCard>

      {/* ── Floating glass info cards ──────────────────────── */}
      <ThreeDCard intensity={15} className="absolute -top-4 -right-4 liquid-card p-4 animate-float-slow z-20" style={{ animationDelay: "0s", maxWidth: 200 }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ background: "rgba(201,168,124,0.15)" }}>📸</div>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Scheduled</span>
          </div>
          <p className="font-headline text-lg" style={{ color: "var(--foreground)" }}>47 posts</p>
          <p className="text-[10px]" style={{ color: "var(--success)" }}>+12 this week</p>
        </div>
      </ThreeDCard>

      <ThreeDCard intensity={15} className="absolute bottom-12 -left-6 liquid-card p-4 animate-float-medium z-20" style={{ animationDelay: "0.8s", maxWidth: 180 }}>
        <div className="relative z-10">
          <p className="font-headline text-2xl" style={{ color: "var(--accent-copper)" }}>30.1K</p>
          <p className="text-[10px]" style={{ color: "var(--muted)" }}>Total followers</p>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1 h-1 rounded-full bg-[var(--success)]" />
            <span className="text-[9px]" style={{ color: "var(--success)" }}>Growing</span>
          </div>
        </div>
      </ThreeDCard>

      <ThreeDCard intensity={15} className="absolute top-1/3 -right-8 liquid-card p-3 animate-float-slow z-20" style={{ animationDelay: "1.5s", maxWidth: 160 }}>
        <div className="relative z-10">
          <div className="flex items-center gap-1 mb-1">
            <svg className="w-3 h-3" style={{ color: "var(--success)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-[10px] font-medium" style={{ color: "var(--success)" }}>+18.2%</span>
          </div>
          <p className="text-[10px]" style={{ color: "var(--muted)" }}>Engagement rate</p>
          <p className="font-headline text-sm" style={{ color: "var(--foreground)" }}>4.8%</p>
        </div>
      </ThreeDCard>

      <ThreeDCard intensity={15} className="absolute bottom-4 right-8 liquid-card p-3 animate-float-medium z-20" style={{ animationDelay: "2s", maxWidth: 150 }}>
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(201,168,124,0.1)" }}>🎯</div>
          <div>
            <p className="text-[10px] font-medium" style={{ color: "var(--foreground)" }}>AI Generating</p>
            <p className="text-[9px]" style={{ color: "var(--muted)" }}>30 posts...</p>
          </div>
        </div>
      </ThreeDCard>
    </div>
  );
}
