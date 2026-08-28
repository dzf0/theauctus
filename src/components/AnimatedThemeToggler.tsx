"use client";

import { useTheme } from "@/components/theme-provider";
import { useCallback, useEffect, useRef, useState } from "react";

interface AnimatedThemeTogglerProps {
  className?: string;
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function AnimatedThemeToggler({
  className = "",
}: AnimatedThemeTogglerProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const handleToggle = useCallback(async () => {
    // Use View Transitions API if available for smooth clip-path animation
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      try {
        const transition = (document as any).startViewTransition(() => {
          toggleTheme();
        });
        await transition.ready;
      } catch {
        toggleTheme();
      }
    } else {
      toggleTheme();
    }
  }, [toggleTheme]);

  if (!mounted) {
    return (
      <button className={`p-2 ${className}`} aria-label="Toggle theme">
        <div className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-all duration-200 hover:bg-white/10 ${className}`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
