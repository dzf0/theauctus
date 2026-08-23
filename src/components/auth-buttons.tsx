"use client";

import Link from "next/link";

export function SignInButton() {
  return (
    <div className="flex items-center gap-3">
      <a
        href="/api/auth/signin"
        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
      >
        Log in
      </a>
      <a
        href="/api/auth/signin"
        className="text-sm font-medium glass-btn-primary"
      >
        Start Free Trial
      </a>
    </div>
  );
}

export function SignOutButton() {
  return (
    <a
      href="/api/auth/signout"
      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
    >
      Sign out
    </a>
  );
}
