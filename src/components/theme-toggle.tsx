"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";

interface ThemeToggleProps {
  width?: number;
  height?: number;
}

export function ThemeToggle({ width = 60, height = 30 }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width, height }} className="rounded-full" />;
  }

  const isDark = theme === "dark";
  const knobSize = height - 6;
  const iconSize = height * 0.38;
  const knobTravel = width - knobSize - 6;

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A87C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F]"
      style={{
        width,
        height,
        cursor: "pointer",
        // 3D track — outer shadow gives depth
        boxShadow: isDark
          ? "inset 0 2px 4px rgba(0,0,0,0.6), inset 0 -1px 2px rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.3)"
          : "inset 0 2px 4px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.1)",
        background: isDark
          ? "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)"
          : "linear-gradient(180deg, #e8e6e1 0%, #d4d2cd 100%)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.1)",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Track highlight (top gloss) */}
      <div
        className="absolute top-0.5 left-1 right-1 h-[40%] rounded-full pointer-events-none"
        style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, transparent 100%)",
          transition: "background 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Stars (dark mode) */}
      <div
        className="absolute left-2 flex items-center gap-0.5"
        style={{
          opacity: isDark ? 1 : 0,
          transition: "opacity 0.4s ease 0.1s",
        }}
      >
        <div className="w-[2px] h-[2px] rounded-full bg-white/40" />
        <div className="w-[3px] h-[3px] rounded-full bg-white/60 mt-0.5" />
        <div className="w-[2px] h-[2px] rounded-full bg-white/30 -mt-1" />
      </div>

      {/* Sun icon (light mode indicator, left side) */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: 6,
          width: knobSize,
          height: knobSize,
          opacity: isDark ? 0.3 : 0.9,
          transform: isDark ? "scale(0.7)" : "scale(1)",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" fill={isDark ? "#6b6560" : "#b8935f"} />
          {!isDark && (
            <g stroke="#b8935f" strokeWidth="1.5" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
              <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
              <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
            </g>
          )}
        </svg>
      </div>

      {/* Moon icon (dark mode indicator, right side) */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          right: 6,
          width: knobSize,
          height: knobSize,
          opacity: isDark ? 0.9 : 0.3,
          transform: isDark ? "scale(1)" : "scale(0.7)",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill={isDark ? "#e8e6e1" : "#9a9590"}
            stroke={isDark ? "#e8e6e1" : "#9a9590"}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 3D Knob */}
      <div
        className="absolute rounded-full z-30"
        style={{
          width: knobSize,
          height: knobSize,
          top: 3,
          left: isDark ? undefined : 3,
          right: isDark ? 3 : undefined,
          // 3D knob: gradient + multiple shadows for depth
          background: isDark
            ? "linear-gradient(145deg, #3a3a3e 0%, #1e1e22 50%, #2a2a2e 100%)"
            : "linear-gradient(145deg, #ffffff 0%, #f0eeea 50%, #e8e6e1 100%)",
          boxShadow: isDark
            ? [
                "0 2px 8px rgba(0,0,0,0.5)",
                "0 4px 16px rgba(0,0,0,0.3)",
                "inset 0 1px 0 rgba(255,255,255,0.1)",
                "inset 0 -1px 2px rgba(0,0,0,0.3)",
                // Glow when in dark mode
                "0 0 12px rgba(201, 168, 124, 0.15)",
              ].join(", ")
            : [
                "0 2px 8px rgba(0,0,0,0.15)",
                "0 4px 12px rgba(0,0,0,0.08)",
                "inset 0 1px 0 rgba(255,255,255,0.9)",
                "inset 0 -1px 2px rgba(0,0,0,0.05)",
              ].join(", "),
          border: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
          // Spring slide + slight tilt
          transform: isDark ? "rotate(0deg)" : "rotate(0deg)",
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Knob gloss highlight */}
        <div
          className="absolute top-[3px] left-[15%] right-[15%] h-[35%] rounded-full pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%)",
            transition: "background 0.5s ease",
          }}
        />

        {/* Knob icon (sun or moon on the knob itself) */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: isDark ? "rotate(360deg)" : "rotate(0deg)",
          }}
        >
          {isDark ? (
            <svg width={iconSize * 0.9} height={iconSize * 0.9} viewBox="0 0 24 24" fill="none">
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                fill="#c9a87c"
                stroke="#c9a87c"
                strokeWidth="1"
              />
            </svg>
          ) : (
            <svg width={iconSize * 0.9} height={iconSize * 0.9} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="#92702a" />
              <g stroke="#92702a" strokeWidth="1.5" strokeLinecap="round">
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
                <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
                <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
              </g>
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
