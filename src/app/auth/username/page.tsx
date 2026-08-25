"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { validateUsername } from "@/lib/validate";
import { Spinner } from "@/components/ui/Loading";

export default function UsernamePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth/signin");
      }
    });
  }, [router]);

  // Debounced username check
  const checkUsername = useCallback(async (value: string) => {
    const err = validateUsername(value);
    if (err) {
      setAvailable(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    try {
      const res = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });
      const data = await res.json();
      setAvailable(data.available);
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  }, []);

  // Debounce
  useEffect(() => {
    if (!username) {
      setAvailable(null);
      setChecking(false);
      return;
    }

    const timer = setTimeout(() => checkUsername(username), 400);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validateUsername(username);
    if (err) {
      setError(err);
      return;
    }

    if (available === false) {
      setError("Username is already taken");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Session expired. Please sign in again.");
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { username },
      });

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      // Update profile with username
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save username");
        setSaving(false);
        return;
      }

      router.push("/auth/pricing");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const handleSkip = () => {
    router.push("/auth/pricing");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <span className="font-headline text-2xl" style={{ color: "var(--foreground)" }}>
              The<span className="accent-text">Auctus</span>
            </span>
          </Link>
          <h1 className="font-headline text-3xl mb-3" style={{ color: "var(--foreground)" }}>
            Choose your username
          </h1>
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            This is how other creators will see you on TheAuctus
          </p>
        </div>

        <div className="liquid-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 liquid-card border border-red-500/20 text-red-400 text-[12px]">
                {error}
              </div>
            )}

            <div>
              <label
                className="block text-[11px] uppercase tracking-[0.1em] mb-2"
                style={{ color: "var(--muted)" }}
              >
                Username
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                    setError("");
                  }}
                  placeholder="yourusername"
                  className="w-full pl-8 pr-10 py-3 liquid-input text-[13px]"
                  autoFocus
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checking && <Spinner size={14} />}
                  {!checking && available === true && (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {!checking && available === false && (
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
              {username && !checking && available === true && (
                <p className="text-[11px] mt-2 text-green-400/80">
                  theauctus.in/@{username}
                </p>
              )}
              {username && !checking && available === false && (
                <p className="text-[11px] mt-2 text-red-400/80">
                  This username is already taken
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--lg-bg)", color: "var(--muted)", border: "1px solid var(--lg-border)" }}>
                  3-20 characters
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--lg-bg)", color: "var(--muted)", border: "1px solid var(--lg-border)" }}>
                  Letters, numbers, _
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!username || available === false || checking || saving}
              className="w-full py-3 liquid-btn-primary text-[13px] disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size={14} /> Saving...
                </span>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-[12px]" style={{ color: "var(--muted)" }}>
          <button onClick={handleSkip} className="hover:opacity-80 transition-opacity">
            Skip for now →
          </button>
        </p>
      </div>
    </div>
  );
}
