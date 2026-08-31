import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const GET = withAuth(
  async (request, { supabase }) => {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const admin = createSupabaseAdminClient();

    // Get users from auth with pagination
    const { data: authUsers, error: authError } =
      await admin.auth.admin.listUsers({
        page: Math.floor(offset / 1000) + 1,
        perPage: Math.min(limit, 1000),
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const userIds = authUsers.users.map((u) => u.id);

    if (userIds.length === 0) {
      return NextResponse.json({ users: [], total: 0 });
    }

    // Batch query profiles, balances, bans, subscriptions, platforms, posts
    const [profilesResult, balancesResult, bansResult, subsResult, platformsResult, postsResult] = await Promise.all([
      supabase.from("profiles").select("*").in("id", userIds),
      supabase.from("credit_balances").select("user_id, balance").in("user_id", userIds),
      supabase.from("ip_bans").select("identifier, reason, banned_at").in("identifier", userIds),
      supabase.from("subscriptions").select("user_id, plan, status").in("user_id", userIds),
      supabase.from("connected_platforms").select("user_id, platform, connected").in("user_id", userIds),
      supabase.from("posts").select("user_id, status").in("user_id", userIds),
    ]);

    const profiles = profilesResult.data;
    const balances = balancesResult.data;
    const bans = bansResult.data;
    const subscriptions = subsResult.data;
    const platforms = platformsResult.data;
    const posts = postsResult.data;

    const balanceMap = new Map(
      (balances || []).map((b) => [b.user_id, b.balance])
    );

    const banMap = new Map(
      (bans || []).map((b) => [b.identifier, { reason: b.reason, banned_at: b.banned_at }])
    );

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    const subMap = new Map(
      (subscriptions || []).map((s) => [s.user_id, { plan: s.plan, status: s.status }])
    );

    // Build platform connection counts
    const platformCountMap = new Map<string, { total: number; connected: number; platforms: string[] }>();
    for (const p of platforms ?? []) {
      if (!platformCountMap.has(p.user_id)) {
        platformCountMap.set(p.user_id, { total: 0, connected: 0, platforms: [] });
      }
      const entry = platformCountMap.get(p.user_id)!;
      entry.total++;
      if (p.connected) {
        entry.connected++;
        entry.platforms.push(p.platform);
      }
    }

    // Build post counts
    const postCountMap = new Map<string, { total: number; published: number; draft: number; scheduled: number }>();
    for (const p of posts ?? []) {
      if (!postCountMap.has(p.user_id)) {
        postCountMap.set(p.user_id, { total: 0, published: 0, draft: 0, scheduled: 0 });
      }
      const entry = postCountMap.get(p.user_id)!;
      entry.total++;
      if (p.status === "published") entry.published++;
      else if (p.status === "draft") entry.draft++;
      else if (p.status === "scheduled") entry.scheduled++;
    }

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
      brand_voice: profileMap.get(u.id)?.brand_voice || null,
      target_audience: profileMap.get(u.id)?.target_audience || null,
      onboarded: profileMap.get(u.id)?.onboarded || false,
      username: profileMap.get(u.id)?.username || null,
      full_name: profileMap.get(u.id)?.full_name || null,
      subscription: subMap.get(u.id) || null,
      platforms: platformCountMap.get(u.id) || { total: 0, connected: 0, platforms: [] },
      posts: postCountMap.get(u.id) || { total: 0, published: 0, draft: 0, scheduled: 0 },
    }));

    return NextResponse.json({ users, total: users.length });
  },
  {
    requireAdmin: true,
    rateLimit: { limit: 30, windowMs: 60_000 },
    rateLimitKey: "admin:users",
    auditAction: "admin_list_users",
  }
);
