"use client";

import Link from "next/link";

export function SignInButton() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
      >
        Log in
      </Link>
      <Link
        href="/dashboard"
        className="text-sm font-medium glass-btn-primary"
      >
        Start Free Trial
      </Link>
    </div>
  );
}

export function SignOutButton() {
  return (
    <Link
      href="/"
      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
    >
      Sign out
    </Link>
  );
}
