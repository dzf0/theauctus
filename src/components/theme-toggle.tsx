"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";

interface ThemeToggleProps {
  width?: number;
  height?: number;
}

export function ThemeToggle({ width = 56, height = 28 }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width, height }} className="rounded-full border-2 border-transparent" />;
  }

  const isDark = theme === "dark";
  const knobSize = height - 4;
  const iconSize = height * 0.4;

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center rounded-full border-2 transition-colors duration-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A87C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F]"
      style={{
        width,
        height,
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
        background: "transparent",
      }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Track background */}
      <div
        className="absolute inset-0 rounded-full transition-colors duration-400"
        style={{
          backgroundColor: isDark ? "#0B0B0B" : "#FFFFFF",
        }}
      />

      {/* Sliding knob */}
      <div
        className="absolute rounded-full border-2 z-30 transition-all"
        style={{
          width: knobSize,
          height: knobSize,
          top: 2,
          left: isDark ? undefined : 2,
          right: isDark ? 2 : undefined,
          backgroundColor: isDark ? "#2A2A2E" : "#F3F2F7",
          borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          transitionDuration: "0.6s",
        }}
      />

      {/* Sun icon (left side) */}
      <div
        className="relative z-30 flex items-center justify-center"
        style={{ width: height, height }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          className="transition-all duration-300"
          style={{
            transform: isDark ? "rotate(45deg) scale(0.8)" : "rotate(0deg) scale(1)",
            opacity: isDark ? 0.5 : 1,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <circle
            cx="12"
            cy="12"
            r="5"
            fill={isDark ? "#8A8A8F" : "#686771"}
          />
          {!isDark && (
            <>
              <line x1="12" y1="1" x2="12" y2="4" stroke="#686771" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="20" x2="12" y2="23" stroke="#686771" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="#686771" strokeWidth="2" strokeLinecap="round" />
              <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="#686771" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="12" x2="4" y2="12" stroke="#686771" strokeWidth="2" strokeLinecap="round" />
              <line x1="20" y1="12" x2="23" y2="12" stroke="#686771" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="#686771" strokeWidth="2" strokeLinecap="round" />
              <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="#686771" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
        </svg>
      </div>

      {/* Moon icon (right side) */}
      <div
        className="relative z-30 flex items-center justify-center"
        style={{ width: height, height }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          className="transition-all duration-300"
          style={{
            transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-15deg) scale(0.8)",
            opacity: isDark ? 1 : 0.4,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill={isDark ? "#F4F4FB" : "#ABABB4"}
            stroke={isDark ? "#F4F4FB" : "#ABABB4"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}
