"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/components/user-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Content Planner",
    href: "/dashboard/planner",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    label: "Content Queue",
    href: "/dashboard/queue",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    // Clear cookies client-side
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (name.startsWith("sb-") || name === "auth-token") {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });

    // Try API call, then redirect
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // Continue even if API fails
    }

    window.location.href = "/";
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-3 px-3 py-2 rounded text-[12px] hover:bg-white/[0.02] transition-colors w-full text-left"
      style={{ color: "var(--muted)" }}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span className="tracking-wide">Sign out</span>
    </button>
  );
}

function TopBarSignOut() {
  const handleSignOut = async () => {
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (name.startsWith("sb-") || name === "auth-token") {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch { /* continue */ }
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-[10px] uppercase tracking-[0.1em] hover:opacity-70 transition-opacity"
      style={{ color: "var(--muted)" }}
    >
      Sign out
    </button>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useUser();

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return "U";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 liquid-sidebar flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 h-16" style={{ borderBottom: "1px solid var(--lg-border)" }}>
          <img src="/logo.svg" alt="TheAuctus" className="w-8 h-8" />
          <span className="font-headline text-lg" style={{ color: "var(--foreground)" }}>The<span className="accent-text">Auctus</span></span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded text-[12px] transition-all"
                style={{ color: isActive ? "var(--foreground)" : "var(--muted)", backgroundColor: isActive ? "var(--lg-bg)" : "transparent" }}>
                {item.icon}
                <span className="tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <div className="liquid-subtle p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent-copper)" }}></div>
              <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>Growth Plan</span>
            </div>
            <p className="text-[10px] mb-2" style={{ color: "var(--muted)" }}>Renews Sep 22, 2026</p>
            <Link href="/dashboard/billing" className="text-[10px] uppercase tracking-[0.1em] accent-text hover:opacity-80 transition-opacity">Manage →</Link>
          </div>
        </div>

        <div className="px-3 pb-4">
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 shrink-0" style={{ borderBottom: "1px solid var(--lg-border)" }}>
          <button className="lg:hidden p-2 -ml-2 transition-colors" style={{ color: "var(--muted)" }} onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 lg:flex-none">
            <h1 className="font-headline text-lg" style={{ color: "var(--foreground)" }}>
              {navItems.find((item) => item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href))?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--success)" }}></div>
              Operational
            </div>
            <ThemeToggle />
            <div className="w-7 h-7 rounded-full liquid-card flex items-center justify-center text-[10px] accent-text font-medium">{getInitials()}</div>
            <TopBarSignOut />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
