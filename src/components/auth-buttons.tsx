"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Clear cookies client-side
      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0].trim();
        if (name.startsWith("sb-") || name === "auth-token") {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });

      // Call the API to sign out
      await fetch("/api/auth/signout", { method: "POST" });

      // Redirect to landing page
      window.location.href = "/";
    } catch {
      // If API fails, just redirect
      window.location.href = "/";
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-xs transition-colors hover:opacity-70"
      style={{ color: "var(--muted)" }}
    >
      Sign out
    </button>
  );
}
