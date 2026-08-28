"use client";

import AnimatedThemeToggler from "@/components/AnimatedThemeToggler";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      {/* Theme toggle — top right */}
      <div className="fixed top-4 right-4 z-50">
        <AnimatedThemeToggler />
      </div>
      {children}
    </div>
  );
}
