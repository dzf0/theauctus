"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createSupabaseClient();

      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (authError) {
        setError(authError.message || "Failed to send reset email");
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <span className="font-headline text-2xl text-[#f5f0eb]">
              The<span className="accent-text">Auctus</span>
            </span>
          </Link>
          <h1 className="font-headline text-3xl text-[#f5f0eb] mb-3">
            Reset your password
          </h1>
          <p className="text-[13px] text-[#6b6560]">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1a1a1a] border border-[#c9a87c]/20 flex items-center justify-center">
              <svg className="w-8 h-8 accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[13px] text-[#9a9590] mb-2">
              Check your email
            </p>
            <p className="text-[12px] text-[#6b6560] mb-8">
              We sent a password reset link to<br />
              <span className="text-[#f5f0eb]">{email}</span>
            </p>
            <Link
              href="/auth/signin"
              className="inline-block px-6 py-3 glass-btn text-[13px]"
            >
              ← Back to sign in
            </Link>
          </div>
        ) : (
          /* Email form */
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 glass-card border border-red-500/20 text-red-400 text-[12px]">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-[#6b6560] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 glass-input text-[13px]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 glass-btn-primary text-[13px] disabled:opacity-50"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center mt-8 text-[12px] text-[#6b6560]">
              Remember your password?{" "}
              <Link href="/auth/signin" className="accent-text hover:text-[#dcc4a0] transition-colors">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
