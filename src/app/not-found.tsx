"use client";

import Link from "next/link";
import { useState } from "react";
import FaultyTerminal from "@/components/FaultyTerminal";
import DepthText from "@/components/DepthText";

// ── Search Bar ──────────────────────────────────────────────
function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md mx-auto">
      <div className="relative group">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for something..."
          className="w-full pl-11 pr-4 py-3 rounded-xl text-[13px] transition-all"
          style={{
            background: "rgba(10,10,15,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#f8fafc",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#C9A87C";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,168,124,0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
    </form>
  );
}

// ── Main 404 Page ───────────────────────────────────────────
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6" style={{ background: '#0a0a0f' }}>
      {/* FaultyTerminal — full-screen, copper-tinted, mouse-reactive */}
      <div className="absolute inset-0 z-0">
        <FaultyTerminal
          scale={1.4}
          gridMul={[2, 1]}
          digitSize={1.3}
          timeScale={0.2}
          scanlineIntensity={0.2}
          glitchAmount={0.8}
          flickerAmount={0.5}
          noiseAmp={0.4}
          chromaticAberration={0.5}
          dither={0.3}
          curvature={0.2}
          tint="#C9A87C"
          mouseReact={true}
          mouseStrength={0.5}
          pageLoadAnimation={true}
          brightness={0.8}
        />
      </div>

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,10,15,0.7) 100%)",
        }}
      />

      {/* Content — layered above terminal with cursor flow */}
      <div className="relative z-10 text-center max-w-2xl mx-auto pointer-events-auto">
        {/* DepthText 404 */}
        <DepthText
          text="404"
          layers={34}
          depth={2.4}
          faceColor="#f8fafc"
          depthColor="#C9A87C"
          tilt={7.5}
          pointerTracking
          smoothing={0.14}
          perspective={900}
          autoOrbit
          orbitSpeed={0.35}
          fontSize="clamp(5rem, 18vw, 12rem)"
          fontWeight={900}
          shadow
        />

        {/* Message */}
        <h2 className="font-headline text-xl sm:text-2xl lg:text-3xl mb-3" style={{ color: "#f8fafc" }}>
          This page has drifted into the void.
        </h2>
        <p className="text-[13px] sm:text-[14px] mb-8 max-w-md mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          The page you&apos;re looking for doesn&apos;t exist, has been moved, or is floating somewhere in deep space.
        </p>

        {/* Blinking terminal cursor */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="text-[11px] font-mono" style={{ color: "#C9A87C" }}>$</span>
          <span
            className="inline-block w-[2px] h-4"
            style={{ background: "#C9A87C", animation: "blink-cursor 1s step-end infinite" }}
          />
        </div>

        {/* Search */}
        <SearchBar />

        {/* Navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl text-[12px] font-medium transition-all"
            style={{ background: "#C9A87C", color: "#0a0a0f" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,168,124,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl text-[12px] font-medium transition-all"
            style={{ background: "rgba(10,10,15,0.6)", border: "1px solid rgba(255,255,255,0.06)", color: "#f8fafc" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9A87C"; e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            Dashboard
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-2.5 rounded-xl text-[12px] font-medium transition-all"
            style={{ background: "rgba(10,10,15,0.6)", border: "1px solid rgba(255,255,255,0.06)", color: "#f8fafc" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9A87C"; e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            Sign Up Free
          </Link>
        </div>

        {/* Easter egg */}
        <p className="mt-12 text-[10px] font-mono tracking-wider" style={{ color: "rgba(255,255,255,0.12)" }}>
          ERR_SPACE_LOST · HTTP 404 · {new Date().toISOString().split("T")[0]}
        </p>
      </div>

      <style jsx global>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
