"use client";

import Link from "next/link";

export function SignInButton() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/signin"
        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
      >
        Log in
      </Link>
      <Link
        href="/auth/signup"
        className="text-sm font-medium glass-btn-primary"
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
        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
