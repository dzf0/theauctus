"use client";

import Link from "next/link";
import { useState } from "react";
import FaultyTerminal from "@/components/FaultyTerminal";
import DepthText from "@/components/DepthText";

// ── ASCII Art Astronaut ─────────────────────────────────────
function LostAstronaut() {
  return (
    <div className="astronaut-float select-none pointer-events-none">
      <pre
        className="text-[6px] sm:text-[8px] leading-[1.1] font-mono"
        style={{ color: "rgba(201,168,124,0.4)" }}
      >
{`    .-"""""-.
   /        \\
  |  O    O  |
  |    __    |
  |   /  \\   |
   \\  \\__/  /
    '-.  .-'
       ||
    ___||___
   /        \\
  |  THE     |
  | AUCTUS   |
   \\________/`}
      </pre>
      <style jsx>{`
        .astronaut-float {
          animation: astronaut-drift 6s ease-in-out infinite;
        }
        @keyframes astronaut-drift {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(2deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
          75% { transform: translateY(-20px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}

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
          style={{ color: "var(--muted)" }}
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
            background: "rgba(10,10,15,0.7)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--foreground)",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#C9A87C";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,168,124,0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
    </form>
  );
}

// ── Blinking Cursor Line ────────────────────────────────────
function BlinkLine() {
  return (
    <div className="flex items-center gap-2 justify-center mt-2">
      <span className="text-[11px] font-mono" style={{ color: "#C9A87C" }}>
        $
      </span>
      <span
        className="inline-block w-[2px] h-4"
        style={{
          background: "#C9A87C",
          animation: "blink-cursor 1s step-end infinite",
        }}
      />
      <style jsx>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}


// ── Main 404 Page ───────────────────────────────────────────
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6" style={{ background: '#0a0a0f' }}>
      {/* FaultyTerminal background — copper-tinted, full-bleed */}
      <div className="absolute inset-0 z-0">
        <FaultyTerminal
          scale={1.2}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={0.25}
          scanlineIntensity={0.15}
          glitchAmount={0.6}
          flickerAmount={0.4}
          noiseAmp={0.3}
          chromaticAberration={0}
          dither={0.5}
          curvature={0.15}
          tint="#C9A87C"
          mouseReact={true}
          mouseStrength={0.3}
          pageLoadAnimation={true}
          brightness={0.7}
        />
      </div>

      {/* Dark overlay to push terminal behind content */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(10,10,15,0.4) 0%, rgba(10,10,15,0.85) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
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

        {/* Floating astronaut */}
        <div className="flex justify-center my-6">
          <LostAstronaut />
        </div>

        {/* Message */}
        <h2
          className="font-headline text-xl sm:text-2xl lg:text-3xl mb-3"
          style={{ color: "var(--foreground)" }}
        >
          This page has drifted into the void.
        </h2>
        <p
          className="text-[13px] sm:text-[14px] mb-8 max-w-md mx-auto leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          The page you&apos;re looking for doesn&apos;t exist, has been moved, or is floating
          somewhere in deep space.
        </p>

        {/* Blinking terminal line */}
        <BlinkLine />

        {/* Search */}
        <div className="mt-8 mb-8">
          <SearchBar />
        </div>

        {/* Navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl text-[12px] font-medium transition-all"
            style={{
              background: "#C9A87C",
              color: "#0a0a0f",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,168,124,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl text-[12px] font-medium transition-all"
            style={{
              background: "rgba(10,10,15,0.7)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--foreground)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C9A87C";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-2.5 rounded-xl text-[12px] font-medium transition-all"
            style={{
              background: "rgba(10,10,15,0.7)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--foreground)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C9A87C";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Sign Up Free
          </Link>
        </div>

        {/* Easter egg: error code */}
        <p
          className="mt-12 text-[10px] font-mono tracking-wider"
          style={{ color: "rgba(255,255,255,0.15)" }}
        >
          ERR_SPACE_LOST · HTTP 404 · {new Date().toISOString().split("T")[0]}
        </p>
      </div>

      {/* Global styles for this page */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .astronaut-float,
          [style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
