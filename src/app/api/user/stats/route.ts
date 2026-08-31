/**
 * GET /api/user/stats
 *
 * Returns real stats from the database:
 * - Credit balance
 * - Total posts
 * - Posts this week
 * - Posts by status
 * - Engagement metrics (likes, comments, shares, reach, impressions)
 */

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";

export const GET = withAuth(async (_request, { supabase, user }) => {
  // Fetch credit balance
  const { data: creditData } = await supabase
    .from("credit_balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const credits = creditData?.balance ?? 0;

  // Fetch all posts for this user
  const { data: posts } = await supabase
    .from("posts")
    .select("id, status, created_at, likes, comments, shares, reach, impressions")
    .eq("user_id", user.id);

  const allPosts = posts || [];

  // Posts this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const postsThisWeek = allPosts.filter(
    (p) => new Date(p.created_at) > weekAgo
  ).length;

  // Posts by status
  const postsByStatus = {
    draft: allPosts.filter((p) => p.status === "draft").length,
    scheduled: allPosts.filter((p) => p.status === "scheduled").length,
    published: allPosts.filter((p) => p.status === "published").length,
  };

  // Aggregate engagement metrics
  const totalLikes = allPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = allPosts.reduce((sum, p) => sum + (p.comments || 0), 0);
  const totalShares = allPosts.reduce((sum, p) => sum + (p.shares || 0), 0);
  const totalReach = allPosts.reduce((sum, p) => sum + (p.reach || 0), 0);
  const totalImpressions = allPosts.reduce((sum, p) => sum + (p.impressions || 0), 0);

  // Calculate engagement rate (likes + comments + shares) / reach * 100
  const totalEngagement = totalLikes + totalComments + totalShares;
  const engagementRate = totalReach > 0
    ? ((totalEngagement / totalReach) * 100).toFixed(1)
    : "0.0";

  return NextResponse.json({
    credits,
    totalPosts: allPosts.length,
    postsThisWeek,
    postsByStatus,
    engagement: {
      totalLikes,
      totalComments,
      totalShares,
      totalReach,
      totalImpressions,
      engagementRate: `${engagementRate}%`,
    },
  });
}, {
  rateLimit: { limit: 30, windowMs: 60_000 },
  rateLimitKey: "user-stats:GET",
});
