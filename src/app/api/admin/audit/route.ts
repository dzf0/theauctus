// ══════════════════════════════════════════════════════════════
// GET /api/admin/audit
//
// Returns audit log entries with pagination and filtering.
// Admin-only endpoint.
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { withAuth } from "@/lib/api-middleware";

export const dynamic = "force-dynamic";

export const GET = withAuth(
  async (request) => {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const action = url.searchParams.get("action"); // optional filter
    const userId = url.searchParams.get("user_id"); // optional filter

    const supabase = createSupabaseAdminClient();

    let query = supabase
      .from("audit_log")
      .select("*, profiles:user_id(email, username)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (action) {
      query = query.eq("action", action);
    }
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      entries: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    });
  },
  { requireAuth: true, requireAdmin: true, auditAction: "admin_audit_viewed" }
);
