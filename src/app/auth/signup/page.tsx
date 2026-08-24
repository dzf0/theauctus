"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";

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
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!formData.username || !formData.fullName || !formData.email) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseClient();

      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", formData.username)
        .single();

      if (existingUser) {
        setError("Username is already taken");
        setLoading(false);
        return;
      }

      // Sign up — Supabase automatically hashes the password with bcrypt
      // and sends a verification email
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

      if (authError) {
        setError(authError.message || "Failed to create account");
        setLoading(false);
        return;
      }

      // Check if email confirmation is needed
      if (data.user && !data.session) {
        // Redirect to OTP verification
        router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      // If auto-confirmed (email confirm disabled), session is set
      if (data.session) {
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch {
      setError("Something went wrong with Google sign-up.");
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
            Create your account
          </h1>
          <p className="text-[13px] text-[#6b6560]">
            Start your 14-day free trial. No credit card required.
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleGoogleSignUp}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 glass-card hover:bg-white/[0.04] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-[13px] text-[#f5f0eb]">Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-white/[0.06]"></div>
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#6b6560]">or</span>
          <div className="flex-1 h-px bg-white/[0.06]"></div>
        </div>

        {/* Email Form */}
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 glass-input text-[13px]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#6b6560] mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="yourusername"
              className="w-full px-4 py-3 glass-input text-[13px]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#6b6560] mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 glass-input text-[13px]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#6b6560] mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
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
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-8 text-[12px] text-[#6b6560]">
          Already have an account?{" "}
          <Link href="/auth/signin" className="accent-text hover:text-[#dcc4a0] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
