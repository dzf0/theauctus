import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { apiValidationError, apiNotFound } from "@/lib/errors";

// ══════════════════════════════════════════════════════════════
// FIELD ALLOWLIST — prevents mass assignment
// ══════════════════════════════════════════════════════════════

const ALLOWED_UPDATE_FIELDS = [
  "username",
  "niche",
  "brand_voice",
  "tone_preferences",
  "target_audience",
  "content_goals",
  "posting_frequency",
  "onboarded",
  "example_posts",
  "full_name",
] as const;

const VALID_VOICES = [
  "professional",
  "casual",
  "humorous",
  "inspirational",
  "educational",
];
const VALID_FREQUENCIES = ["daily", "3-5x-week", "1-2x-week", "weekly"];

// ══════════════════════════════════════════════════════════════
// VALIDATION
// ══════════════════════════════════════════════════════════════

function validateProfileField(
  key: string,
  value: unknown
): string | null {
  if (typeof value === "string" && value.length > 2000) {
    return `${key} is too long (max 2000 characters)`;
  }
  if (Array.isArray(value) && value.length > 20) {
    return `${key} has too many items (max 20)`;
  }
  if (
    key === "brand_voice" &&
    typeof value === "string" &&
    !VALID_VOICES.includes(value)
  ) {
    return "Invalid brand voice";
  }
  if (
    key === "posting_frequency" &&
    typeof value === "string" &&
    !VALID_FREQUENCIES.includes(value)
  ) {
    return "Invalid posting frequency";
  }
  if (key === "onboarded" && typeof value !== "boolean") {
    return "onboarded must be a boolean";
  }
  if (key === "niche" && typeof value === "string" && value.length > 100) {
    return "Niche is too long (max 100 characters)";
  }
  if (
    key === "target_audience" &&
    typeof value === "string" &&
    value.length > 500
  ) {
    return "Target audience is too long (max 500 characters)";
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// GET /api/profile
// ══════════════════════════════════════════════════════════════

export const GET = withAuth(async (_request, { supabase, user }) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ profile: data });
});

// ══════════════════════════════════════════════════════════════
// POST /api/profile — Full profile update (onboarding)
// ══════════════════════════════════════════════════════════════

export const POST = withAuth(
  async (request, { supabase, user }) => {
    const body = await request.json();
    const {
      niche,
      brandVoice,
      tonePreferences,
      targetAudience,
      contentGoals,
      postingFrequency,
      onboarded,
    } = body;

    // Validate required fields
    if (!niche || !brandVoice || !targetAudience || !postingFrequency) {
      return apiValidationError("All fields are required");
    }

    if (!tonePreferences || tonePreferences.length === 0) {
      return apiValidationError("Select at least one tone preference");
    }

    if (!contentGoals || contentGoals.length === 0) {
      return apiValidationError("Select at least one content goal");
    }

    // Validate individual fields
    const voiceError = validateProfileField("brand_voice", brandVoice);
    if (voiceError) return apiValidationError(voiceError);

    const freqError = validateProfileField("posting_frequency", postingFrequency);
    if (freqError) return apiValidationError(freqError);

    if (typeof niche === "string" && niche.length > 100) {
      return apiValidationError("Niche is too long");
    }

    if (typeof targetAudience === "string" && targetAudience.length > 500) {
      return apiValidationError("Target audience is too long");
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        niche,
        brand_voice: brandVoice,
        tone_preferences: tonePreferences,
        target_audience: targetAudience,
        content_goals: contentGoals,
        posting_frequency: postingFrequency,
        onboarded: onboarded || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  },
  {
    auditAction: "update_profile",
  }
);

// ══════════════════════════════════════════════════════════════
// PUT /api/profile — Partial profile update (whitelist fields)
// ══════════════════════════════════════════════════════════════

export const PUT = withAuth(
  async (request, { supabase, user }) => {
    const body = await request.json();

    // Only allow known fields through
    const allowedUpdates: Record<string, unknown> = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (body[key] !== undefined) {
        const validationError = validateProfileField(key, body[key]);
        if (validationError) {
          return apiValidationError(validationError);
        }
        allowedUpdates[key] = body[key];
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return apiValidationError("No valid fields to update");
    }

    allowedUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("profiles")
      .update(allowedUpdates)
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  },
  {
    rateLimit: { limit: 30, windowMs: 60_000 },
    rateLimitKey: "profile:PUT",
    auditAction: "update_profile",
  }
);
