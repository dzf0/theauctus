import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — BYPASSES ALL ROW LEVEL SECURITY.
 *
 * ⚠️ SERVER-SIDE ONLY. Never import this from a client component —
 * the service role key must never reach the browser.
 *
 * Use for trusted server-side operations that must see all rows:
 *   - username availability checks (RLS would blind anon queries)
 *   - admin operations
 *   - cleanup jobs
 */
export function createSupabaseAdminClient() {
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
