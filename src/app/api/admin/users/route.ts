import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const GET = withAuth(
  async (_request, { supabase }) => {
    const admin = createSupabaseAdminClient();

    // Get all users from auth
    const { data: authUsers, error: authError } =
      await admin.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const userIds = authUsers.users.map((u) => u.id);

    // Get profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    // Get credit balances
    const { data: balances } = await supabase
      .from("credit_balances")
      .select("user_id, balance")
      .in("user_id", userIds);

    // Get ban status from ip_bans table
    const { data: bans } = await supabase
      .from("ip_bans")
      .select("identifier, reason, banned_at")
      .in("identifier", userIds);

    const balanceMap = new Map(
      (balances || []).map((b) => [b.user_id, b.balance])
    );

    const banMap = new Map(
      (bans || []).map((b) => [b.identifier, { reason: b.reason, banned_at: b.banned_at }])
    );

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    const users = authUsers.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at,
      is_admin: adminEmails.includes((u.email || "").toLowerCase()),
      banned: banMap.has(u.id),
      ban_info: banMap.get(u.id) || null,
      credits: balanceMap.get(u.id) ?? 0,
      niche: profileMap.get(u.id)?.niche || null,
      onboarded: profileMap.get(u.id)?.onboarded || false,
      username: profileMap.get(u.id)?.username || null,
    }));

    return NextResponse.json({ users });
  },
  {
    requireAdmin: true,
    rateLimit: { limit: 30, windowMs: 60_000 },
    rateLimitKey: "admin:users",
    auditAction: "admin_list_users",
  }
);
