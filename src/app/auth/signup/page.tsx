"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  getPasswordRuleResults,
  getPasswordStrength,
  PASSWORD_RULES,
} from "@/lib/validate";
import { Spinner } from "@/components/ui/Loading";

// Rate limiting
const MAX_SIGNUP_ATTEMPTS = 3;
const LOCKOUT_DURATION = 10 * 60 * 1000; // 10 minutes

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  const attemptsRef = useRef<{ count: number; firstAttempt: number }>({
    count: 0,
    firstAttempt: 0,
  });

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const attempts = attemptsRef.current;

    if (attempts.count >= MAX_SIGNUP_ATTEMPTS) {
      const timeLeft = Math.ceil((attempts.firstAttempt + LOCKOUT_DURATION - now) / 1000);
      if (timeLeft > 0) {
        setIsLocked(true);
        setLockoutTime(timeLeft);
        return false;
      }
      attempts.count = 0;
      attempts.firstAttempt = now;
    }

    attempts.count++;
    if (attempts.count === 1) attempts.firstAttempt = now;
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkRateLimit()) return;

    setLoading(true);
    setError("");

    const emailError = validateEmail(formData.email);
    if (emailError) { setError(emailError); setLoading(false); return; }

    const usernameError = validateUsername(formData.username);
    if (usernameError) { setError(usernameError); setLoading(false); return; }

    if (!formData.fullName.trim()) { setError("Full name is required"); setLoading(false); return; }

    const passwordError = validatePassword(formData.password);
    if (passwordError) { setError(passwordError); setLoading(false); return; }

    if (formData.password !== formData.confirmPassword) { setError("Passwords don't match"); setLoading(false); return; }

    try {
      const supabase = createSupabaseClient();

      const usernameRes = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username }),
      });
      const usernameData = await usernameRes.json();

      if (!usernameData.available) {
        setError("Username is already taken");
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
          },
        },
      });

      if (authError) { setError(authError.message || "Failed to create account"); setLoading(false); return; }

      if (data.user && !data.session) {
      // Save onboarding data from localStorage if present
      const savedOnboarding = localStorage.getItem("theauctus-onboarding");
      if (savedOnboarding) {
        try {
          const onboardingData = JSON.parse(savedOnboarding);
          await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(onboardingData),
          });
          localStorage.removeItem("theauctus-onboarding");
        } catch {
          // Continue anyway — onboarding data is optional
        }
      }
        router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      if (data.session) {
      // Save onboarding data from localStorage if present
      const savedOnboarding = localStorage.getItem("theauctus-onboarding");
      if (savedOnboarding) {
        try {
          const onboardingData = JSON.parse(savedOnboarding);
          await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(onboardingData),
          });
          localStorage.removeItem("theauctus-onboarding");
        } catch {
          // Continue anyway — onboarding data is optional
        }
      }
        router.push("/auth/pricing");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!checkRateLimit()) return;
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/api/auth/callback?next=/auth/username` },
      });
      if (error) setError(error.message);
    } catch {
      setError("Something went wrong with Google sign-up.");
    }
  };

  const passwordRules = getPasswordRuleResults(formData.password);
  const passwordStrength = getPasswordStrength(formData.password);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (isLocked && lockoutTime > 0) {
    setTimeout(() => {
      const t = lockoutTime - 1;
      if (t <= 0) { setIsLocked(false); attemptsRef.current = { count: 0, firstAttempt: 0 }; }
      else setLockoutTime(t);
    }, 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <span className="font-headline text-2xl" style={{ color: "var(--foreground)" }}>
              The<span className="accent-text">Auctus</span>
            </span>
          </Link>
          <h1 className="font-headline text-3xl mb-3" style={{ color: "var(--foreground)" }}>Create your account</h1>
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>10 free credits included. No credit card required.</p>
        </div>

        {isLocked && (
          <div className="mb-6 p-3 liquid-card border border-amber-500/20 text-amber-400 text-[12px]">
            Too many attempts. Please try again in {formatTime(lockoutTime)}.
          </div>
        )}

        <div className="space-y-3 mb-8">
          <button onClick={handleGoogleSignUp} disabled={isLocked}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 liquid-card hover:border-[var(--lg-border-strong)] transition-all duration-300 disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>Continue with Google</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px" style={{ background: "var(--lg-border)" }}></div>
          <span className="text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--lg-border)" }}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 liquid-card border border-red-500/20 text-red-400 text-[12px]">{error}</div>}

          {[
            { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
            { label: "Username", name: "username", type: "text", placeholder: "yourusername" },
            { label: "Full Name", name: "fullName", type: "text", placeholder: "John Doe" },
            { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
            { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "••••••••" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-[11px] uppercase tracking-[0.1em] mb-2" style={{ color: "var(--muted)" }}>{field.label}</label>
              <input type={field.type} name={field.name} value={(formData as Record<string, string>)[field.name]} onChange={handleChange} placeholder={field.placeholder} className="w-full px-4 py-3 liquid-input text-[13px]" required disabled={isLocked} />
              {field.name === "password" && formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--lg-bg)" }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(passwordStrength.score / 4) * 100}%`, backgroundColor: passwordStrength.color }} />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {PASSWORD_RULES.map((rule, i) => (
                      <div key={rule.id} className="flex items-center gap-1.5 text-[10px]">
                        <span className="w-3 h-3 flex items-center justify-center rounded-full" style={{ backgroundColor: passwordRules[i] ? "rgba(34, 197, 94, 0.15)" : "var(--lg-bg)", color: passwordRules[i] ? "#22c55e" : "var(--muted)" }}>
                          {passwordRules[i] ? "✓" : "·"}
                        </span>
                        <span style={{ color: "var(--muted)" }}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button type="submit" disabled={loading || isLocked} className="w-full py-3 liquid-btn-primary text-[13px] disabled:opacity-50">
            {loading ? <span className="flex items-center justify-center gap-2"><Spinner size={14} /> Creating account...</span> : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-8 text-[12px]" style={{ color: "var(--muted)" }}>
          Already have an account? <Link href="/auth/signin" className="accent-text hover:opacity-80 transition-opacity">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
