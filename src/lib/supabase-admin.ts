import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — BYPASSES ALL ROW LEVEL SECURITY.
 *
 * ⚠️ SERVER-SIDE ONLY. Never import this from a client component —
 * the service role key must never reach the browser.
 *
 * Runtime guard: throws if called from a browser context.
 *
 * Use for trusted server-side operations that must see all rows:
 *   - Username availability checks (RLS would blind anon queries)
 *   - Admin operations
 *   - Cleanup jobs
 *   - Stripe webhook processing
 */
export function createSupabaseAdminClient() {
  // Runtime guard: prevent accidental use in browser
  if (typeof window !== "undefined") {
    throw new Error(
      "createSupabaseAdminClient must NOT be called from client code. " +
      "The service-role key must never reach the browser."
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "supabase-admin: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (server-side only)"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
