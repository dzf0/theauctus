// ══════════════════════════════════════════════════════════════
// GET /api/platforms
//
// Returns connection status for all platforms for the current user.
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";

const ALL_PLATFORMS = [
  { id: "twitter", label: "Twitter / X", color: "#1DA1F2" },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2" },
  { id: "instagram", label: "Instagram", color: "#E4405F" },
  { id: "facebook", label: "Facebook", color: "#1877F2" },
  { id: "threads", label: "Threads", color: "#000000" },
  { id: "youtube", label: "YouTube", color: "#FF0000" },
  { id: "tiktok", label: "TikTok", color: "#000000" },
  { id: "blog", label: "Blog", color: "#FF6B6B" },
];

export const GET = withAuth(async (_request, { supabase, user }) => {
  const { data: connections } = await supabase
    .from("connected_platforms")
    .select("platform, connected, platform_name, username, followers, last_sync")
    .eq("user_id", user.id);

  const connectionMap = new Map(
    (connections || []).map((c) => [c.platform, c])
  );

  const platforms = ALL_PLATFORMS.map((p) => ({
    ...p,
    connected: connectionMap.get(p.id)?.connected ?? false,
    platformName: connectionMap.get(p.id)?.platform_name ?? null,
    username: connectionMap.get(p.id)?.username ?? null,
    followers: connectionMap.get(p.id)?.followers ?? 0,
    lastSync: connectionMap.get(p.id)?.last_sync ?? null,
  }));

  return NextResponse.json({ platforms });
}, {
  rateLimit: { limit: 30, windowMs: 60_000 },
  rateLimitKey: "platforms:GET",
});
