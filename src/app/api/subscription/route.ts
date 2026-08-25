import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { apiNotFound } from "@/lib/errors";

// ══════════════════════════════════════════════════════════════
// PLAN FEATURES — defines what each tier can access
// ══════════════════════════════════════════════════════════════

export const PLAN_FEATURES = {
  starter: {
    name: "Starter",
    maxPlatforms: 3,
    maxPostsPerMonth: 30,
    maxCalendarsPerMonth: 1,
    analyticsEnabled: false,
    contentRepurposing: false,
    growthTactics: false,
    teamSeats: 0,
    apiAccess: false,
    whiteLabel: false,
    customAITraining: false,
    referralProgram: false,
  },
  growth: {
    name: "Growth",
    maxPlatforms: -1, // unlimited
    maxPostsPerMonth: -1, // unlimited
    maxCalendarsPerMonth: -1, // unlimited
    analyticsEnabled: true,
    contentRepurposing: true,
    growthTactics: true,
    teamSeats: 0,
    apiAccess: false,
    whiteLabel: false,
    customAITraining: false,
    referralProgram: true,
  },
  scale: {
    name: "Scale",
    maxPlatforms: -1,
    maxPostsPerMonth: -1,
    maxCalendarsPerMonth: -1,
    analyticsEnabled: true,
    contentRepurposing: true,
    growthTactics: true,
    teamSeats: 5,
    apiAccess: true,
    whiteLabel: true,
    customAITraining: true,
    referralProgram: true,
  },
} as const;

// ══════════════════════════════════════════════════════════════
// GET /api/subscription — Get current user's plan and features
// ══════════════════════════════════════════════════════════════

export const GET = withAuth(async (_request, { supabase, user }) => {
  const { data: sub, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (subError || !sub) {
    return apiNotFound("Subscription");
  }

  const plan = (sub.plan || "starter") as keyof typeof PLAN_FEATURES;
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.starter;

  return NextResponse.json({
    subscription: {
      plan: sub.plan,
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
      createdAt: sub.created_at,
    },
    features,
  });
});
