"use client";

import { useCallback, useRef } from "react";

/**
 * Client-side CSRF token management.
 *
 * Fetches a CSRF token from /api/auth/csrf and caches it for 1 hour.
 * Provides a wrapper around fetch() that automatically attaches the token.
 *
 * Usage:
 *   const { csrfFetch } = useCsrf();
 *   const res = await csrfFetch("/api/posts", { method: "POST", body: ... });
 *
 * Currently the server-side CSRF check is disabled by default (csrfProtection: true
 * must be explicitly set on each route). When you're ready to re-enable CSRF globally:
 *   1. Set csrfProtection: true on withAuth() calls
 *   2. Wrap all client-side state-changing fetch calls with csrfFetch()
 */

interface CsrfToken {
  token: string;
  expiresAt: number;
}

const TOKEN_LIFETIME_MS = 50 * 60 * 1000; // 50 minutes (server token lasts 1 hour)

export function useCsrf() {
  const tokenRef = useRef<CsrfToken | null>(null);

  const getToken = useCallback(async (): Promise<string | null> => {
    // Return cached token if still valid
    if (tokenRef.current && Date.now() < tokenRef.current.expiresAt) {
      return tokenRef.current.token;
    }

    try {
      const res = await fetch("/api/auth/csrf");
      if (!res.ok) return null;

      const data = await res.json();
      const token = data.token;

      if (!token) return null;

      tokenRef.current = {
        token,
        expiresAt: Date.now() + TOKEN_LIFETIME_MS,
      };

      return token;
    } catch {
      return null;
    }
  }, []);

  const csrfFetch = useCallback(
    async (url: string, init?: RequestInit): Promise<Response> => {
      const token = await getToken();

      const headers = new Headers(init?.headers);

      if (token) {
        headers.set("x-csrf-token", token);
      }

      return fetch(url, { ...init, headers });
    },
    [getToken]
  );

  return { csrfFetch, getToken };
}
