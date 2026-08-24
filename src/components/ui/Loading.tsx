"use client";

import { useEffect, useState } from "react";

// ── Spinner ─────────────────────────────────────────────────────
export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ── Dots (bouncing) ────────────────────────────────────────────
export function Dots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

// ── Skeleton ────────────────────────────────────────────────────
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-white/[0.06] rounded ${className}`}
    />
  );
}

// ── Skeleton Card ───────────────────────────────────────────────
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="glass-card p-6 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          // vary widths for visual interest
        />
      ))}
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ── Skeleton Stat Card ──────────────────────────────────────────
export function SkeletonStat() {
  return (
    <div className="glass-card p-5">
      <Skeleton className="h-3 w-16 mb-3" />
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-2 w-20" />
    </div>
  );
}

// ── Progress Bar ────────────────────────────────────────────────
export function ProgressBar({
  progress,
  label,
  className = "",
}: {
  progress: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#9a9590]">{label}</span>
          <span className="text-[11px] accent-text">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#c9a87c] to-[#dcc4a0] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ── Pulsing Dot (live indicator) ────────────────────────────────
export function PulsingDot({ color = "#c9a87c" }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

// ── Page Loader (full-screen with branding) ─────────────────────
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-2 border-white/[0.06] border-t-[#c9a87c] animate-spin" />
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#c9a87c] animate-pulse" />
        </div>
      </div>
      <p className="text-[12px] text-[#6b6560] animate-pulse">{message}</p>
    </div>
  );
}

// ── AI Generation Loader (with animated steps) ──────────────────
export function AILoader({ step = 0 }: { step?: number }) {
  const steps = [
    "Analyzing your brand profile...",
    "Researching trending topics...",
    "Crafting content hooks...",
    "Writing platform-specific posts...",
    "Optimizing posting schedule...",
    "Finalizing your calendar...",
  ];

  const currentStep = step % steps.length;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Animated rings */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-white/[0.06] border-t-[#c9a87c] animate-spin" />
        <div
          className="absolute inset-2 rounded-full border-2 border-white/[0.04] border-b-[#dcc4a0] animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 accent-text animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar progress={progress} className="w-64" />

      {/* Step text */}
      <div className="text-center">
        <p className="text-[13px] text-[#f5f0eb] animate-pulse">
          {steps[currentStep]}
        </p>
        <p className="text-[11px] text-[#6b6560] mt-1">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>

      {/* Tip */}
      <p className="text-[10px] text-[#6b6560] max-w-xs text-center">
        This usually takes 15-30 seconds. Each calendar generates unique, platform-optimized content.
      </p>
    </div>
  );
}

// ── Skeleton Dashboard ──────────────────────────────────────────
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>
      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SkeletonCard lines={5} />
        </div>
        <div>
          <SkeletonCard lines={3} />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Planner ────────────────────────────────────────────
export function SkeletonPlanner() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square glass-card p-2">
            <Skeleton className="h-3 w-6 mb-2" />
            {i % 3 === 0 && <Skeleton className="h-2 w-full mb-1" />}
            {i % 4 === 0 && <Skeleton className="h-2 w-3/4" />}
          </div>
        ))}
      </div>
    </div>
  );
}
