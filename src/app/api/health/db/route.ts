import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { withAuth, isAdminEmail } from "@/lib/api-middleware";

/**
 * GET /api/health/db
 *
 * Verifies all expected tables exist and are queryable.
 * Admin-only endpoint — requires authenticated admin user.
 */
export const dynamic = "force-dynamic";

const TABLE_CHECKS = [
  { table: "profiles", columns: "id, email, name, full_name, avatar_url, username, onboarded" },
  { table: "subscriptions", columns: "id, user_id, plan, status" },
  { table: "connected_platforms", columns: "id, user_id, platform, connected" },
  { table: "content_calendars", columns: "id, user_id, month, year" },
  { table: "posts", columns: "id, user_id, title, content, platform, status" },
  { table: "credit_balances", columns: "id, user_id, balance" },
  { table: "credit_history", columns: "id, user_id, amount, type" },
  { table: "audit_log", columns: "id, action" },
] as const;

export const GET = withAuth(
  async () => {
    try {
      const supabase = createSupabaseAdminClient();
      const results: Record<string, { healthy: boolean; error?: string }> = {};

      for (const { table, columns } of TABLE_CHECKS) {
        const { error } = await supabase
          .from(table)
          .select(columns)
          .limit(0);

        results[table] = error
          ? { healthy: false, error: error.message }
          : { healthy: true };
      }

      const allHealthy = Object.values(results).every((r) => r.healthy);
      const failedTables = Object.entries(results)
        .filter(([, r]) => !r.healthy)
        .map(([table, r]) => `${table}: ${r.error}`);

      return NextResponse.json({
        status: allHealthy ? "healthy" : "degraded",
        healthy: allHealthy,
        message: allHealthy
          ? `All ${TABLE_CHECKS.length} tables verified`
          : `Failed tables: ${failedTables.join("; ")}`,
        tables: results,
      });
    } catch (err) {
      return NextResponse.json(
        {
          status: "error",
          healthy: false,
          message: err instanceof Error ? err.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  },
  { requireAuth: true, requireAdmin: true, auditAction: "health_db_check" }
);
