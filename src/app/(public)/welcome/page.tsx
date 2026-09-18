/**
 * /welcome — Post-checkout success page
 *
 * Shown after Paddle checkout completes and redirects here.
 * Displays a welcome message and redirects to the dashboard.
 *
 * Security:
 * - No sensitive data exposed
 * - No API keys in client code
 * - Simple redirect — no state manipulation
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/dashboard";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}
        >
          <svg className="w-10 h-10" style={{ color: "#22c55e" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="font-headline text-3xl mb-3" style={{ color: "var(--foreground)" }}>
          Welcome aboard!
        </h1>
        <p className="text-[14px] mb-8" style={{ color: "var(--muted)" }}>
          Your subscription is active. You now have access to all features in your plan.
        </p>

        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 liquid-btn-primary text-[14px] font-medium"
        >
          Go to Dashboard
        </Link>

        <p className="text-[12px] mt-4" style={{ color: "var(--muted)" }}>
          Redirecting in {countdown}s...
        </p>
      </div>
    </div>
  );
}
