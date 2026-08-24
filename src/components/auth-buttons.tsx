"use client";

import Link from "next/link";

export function SignInButton() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/signin"
        className="text-sm font-medium transition-colors"
        style={{ color: "var(--muted)" }}
      >
        Log in
      </Link>
      <Link
        href="/auth/signup"
        className="text-sm font-medium liquid-btn-primary"
      >
        Start Free Trial
      </Link>
    </div>
  );
}

export function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="POST" className="inline">
      <button
        type="submit"
        className="text-xs transition-colors hover:opacity-70"
        style={{ color: "var(--muted)" }}
      >
        Sign out
      </button>
    </form>
  );
}
