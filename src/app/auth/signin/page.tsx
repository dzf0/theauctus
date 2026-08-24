"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { Spinner } from "@/components/ui/Loading";

// Rate limiting config
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 60 * 1000; // 1 minute window for tracking

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  // Rate limiting state
  const attemptsRef = useRef<{ count: number; firstAttempt: number }>({
    count: 0,
    firstAttempt: 0,
  });
  const lockoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const attempts = attemptsRef.current;

    // Reset if window has passed
    if (now - attempts.firstAttempt > ATTEMPT_WINDOW) {
      attempts.count = 0;
      attempts.firstAttempt = now;
    }

    // Check if locked out
    if (attempts.count >= MAX_ATTEMPTS) {
      const timeLeft = Math.ceil((attempts.firstAttempt + LOCKOUT_DURATION - now) / 1000);
      if (timeLeft > 0) {
        setIsLocked(true);
        setLockoutTime(timeLeft);
        return false;
      }
      // Reset after lockout
      attempts.count = 0;
      attempts.firstAttempt = now;
    }

    attempts.count++;
    if (attempts.count === 1) {
      attempts.firstAttempt = now;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit
    if (!checkRateLimit()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createSupabaseClient();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!checkRateLimit()) {
      return;
    }

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch {
      setError("Something went wrong with Google sign-in.");
    }
  };

  // Update lockout timer
  if (isLocked && lockoutTime > 0) {
    setTimeout(() => {
      const newTime = lockoutTime - 1;
      if (newTime <= 0) {
        setIsLocked(false);
        attemptsRef.current = { count: 0, firstAttempt: 0 };
      } else {
        setLockoutTime(newTime);
      }
    }, 1000);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <span className="font-headline text-2xl" style={{ color: "var(--foreground)" }}>
              The<span className="accent-text">Auctus</span>
            </span>
          </Link>
          <h1 className="font-headline text-3xl mb-3" style={{ color: "var(--foreground)" }}>
            Welcome back
          </h1>
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            Sign in to your account
          </p>
        </div>

        {/* Rate limit warning */}
        {isLocked && (
          <div className="mb-6 p-3 liquid-card border border-amber-500/20 text-amber-400 text-[12px]">
            Too many attempts. Please try again in {formatTime(lockoutTime)}.
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLocked}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 liquid-card hover:border-[var(--lg-border-strong)] transition-all duration-300 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
              Continue with Google
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px" style={{ background: "var(--lg-border)" }}></div>
          <span className="text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>
            or
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--lg-border)" }}></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 liquid-card border border-red-500/20 text-red-400 text-[12px]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] mb-2" style={{ color: "var(--muted)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 liquid-input text-[13px]"
              required
              disabled={isLocked}
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] mb-2" style={{ color: "var(--muted)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 liquid-input text-[13px]"
              required
              disabled={isLocked}
            />
          </div>

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-[11px] hover:opacity-80 transition-opacity" style={{ color: "var(--muted)" }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full py-3 liquid-btn-primary text-[13px] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size={14} /> Signing in...
              </span>
            ) : isLocked ? (
              `Locked out for ${formatTime(lockoutTime)}`
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-8 text-[12px]" style={{ color: "var(--muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="accent-text hover:opacity-80 transition-opacity">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
