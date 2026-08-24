"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);

  // Verify the user has a valid recovery session
  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No session — the recovery link may have expired or been used
        setError("This reset link has expired or is invalid. Please request a new one.");
      }
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseClient();

      const { error: authError } = await supabase.auth.updateUser({
        password: password,
      });

      if (authError) {
        setError(authError.message || "Failed to update password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[13px] text-[#6b6560]">Verifying reset link...</div>
      </div>
    );
  }

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
            Set new password
          </h1>
          <p className="text-[13px] text-[#6b6560]">
            Choose a strong password for your account
          </p>
        </div>

        {success ? (
          /* Success state */
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1a1a1a] border border-[#c9a87c]/20 flex items-center justify-center">
              <svg className="w-8 h-8 accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[13px] text-[#9a9590] mb-2">
              Password updated!
            </p>
            <p className="text-[12px] text-[#6b6560]">
              Redirecting you to the dashboard...
            </p>
          </div>
        ) : (
          /* Password form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 glass-card border border-red-500/20 text-red-400 text-[12px]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-[0.1em] text-[#6b6560] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 glass-input text-[13px]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.1em] text-[#6b6560] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 glass-input text-[13px]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 glass-btn-primary text-[13px] disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center mt-8 text-[12px] text-[#6b6560]">
          <Link href="/auth/signin" className="accent-text hover:text-[#dcc4a0] transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
