import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";

// ══════════════════════════════════════════════════════════════
// GET /api/credits/history — Get current user's credit history
// ══════════════════════════════════════════════════════════════

export const GET = withAuth(async (_request, { supabase, user }) => {
  const { data, error } = await supabase
    .from("credit_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ history: data || [] });
}, {
  rateLimit: { limit: 30, windowMs: 60_000 },
  rateLimitKey: "credits:history",
});
