"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import React from "react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  try {
    return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
  } catch {
    return <>{children}</>;
  }
}
