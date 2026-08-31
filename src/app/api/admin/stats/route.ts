// ══════════════════════════════════════════════════════════════
// GET /api/admin/stats
//
// Returns aggregate admin metrics: revenue, credits in circulation,
// signups over time, platform connections, and credit usage.
// Admin-only endpoint.
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { withAuth } from "@/lib/api-middleware";

export const dynamic = "force-dynamic";

export const GET = withAuth(
  async () => {
    const supabase = createSupabaseAdminClient();

    // ── Total users & growth ───────────────────────────────
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsers30d } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsers7d } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo);

    // ── Credit metrics ─────────────────────────────────────
    const { data: allBalances } = await supabase
      .from("credit_balances")
      .select("balance");

    const totalCreditsInCirculation = (allBalances ?? []).reduce(
      (sum, b) => sum + (b.balance ?? 0),
      0
    );

    // Total credits purchased (all time)
    const { data: purchaseHistory } = await supabase
      .from("credit_history")
      .select("amount, created_at")
      .eq("type", "purchase");

    const totalCreditsPurchased = (purchaseHistory ?? []).reduce(
      (sum, h) => sum + (h.amount ?? 0),
      0
    );

    // Total credits used (all time)
    const { data: usageHistory } = await supabase
      .from("credit_history")
      .select("amount, created_at")
      .eq("type", "usage");

    const totalCreditsUsed = (usageHistory ?? []).reduce(
      (sum, h) => sum + Math.abs(h.amount ?? 0),
      0
    );

    // Revenue from purchases (credits * $1/credit approximate)
    // More accurate: count purchases in last 30 days
    const recentPurchases = (purchaseHistory ?? []).filter(
      (h) => h.created_at && h.created_at >= thirtyDaysAgo
    );
    const creditsPurchased30d = recentPurchases.reduce(
      (sum, h) => sum + (h.amount ?? 0),
      0
    );

    // ── Platform connections ───────────────────────────────
    const { data: platforms } = await supabase
      .from("connected_platforms")
      .select("platform, connected");

    const platformStats: Record<string, { total: number; connected: number }> = {};
    for (const p of platforms ?? []) {
      if (!platformStats[p.platform]) {
        platformStats[p.platform] = { total: 0, connected: 0 };
      }
      platformStats[p.platform].total++;
      if (p.connected) platformStats[p.platform].connected++;
    }

    // ── Posts & calendars ──────────────────────────────────
    const { count: totalPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    const { count: publishedPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    const { count: totalCalendars } = await supabase
      .from("content_calendars")
      .select("*", { count: "exact", head: true });

    // ── Signups per day (last 14 days) — single query ─────────
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentProfiles } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", fourteenDaysAgo);

    // Bucket by day
    const dayCounts = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dayCounts.set(d.toISOString().split("T")[0], 0);
    }
    for (const p of recentProfiles ?? []) {
      const day = p.created_at.split("T")[0];
      if (dayCounts.has(day)) dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }
    const signupsByDay = [...dayCounts.entries()].map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      users: {
        total: totalUsers ?? 0,
        newLast30d: newUsers30d ?? 0,
        newLast7d: newUsers7d ?? 0,
      },
      credits: {
        totalInCirculation: totalCreditsInCirculation,
        totalPurchased: totalCreditsPurchased,
        totalUsed: totalCreditsUsed,
        purchasedLast30d: creditsPurchased30d,
      },
      platforms: platformStats,
      content: {
        totalPosts: totalPosts ?? 0,
        publishedPosts: publishedPosts ?? 0,
        totalCalendars: totalCalendars ?? 0,
      },
      signupsByDay,
    });
  },
  { requireAuth: true, requireAdmin: true, auditAction: "admin_stats_viewed" }
);
