import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { apiValidationError, apiNotFound } from "@/lib/errors";

// ══════════════════════════════════════════════════════════════
// FIELD ALLOWLIST — prevents mass assignment
// ══════════════════════════════════════════════════════════════

const ALLOWED_FIELDS = new Set([
  "name",
  "full_name",
  "niche",
  "brand_voice",
  "target_audience",
  "goals",
  "keywords",
  "onboarded",
]);

const VALID_VOICES = [
  "professional",
  "casual",
  "humorous",
  "inspirational",
  "educational",
];

function validateField(key: string, value: unknown): string | null {
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
  if (key === "niche" && typeof value === "string" && value.length > 100) {
    return "Niche is too long";
  }
  if (
    key === "target_audience" &&
    typeof value === "string" &&
    value.length > 500
  ) {
    return "Target audience is too long";
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// GET /api/user — Get current user profile
// ══════════════════════════════════════════════════════════════

export const GET = withAuth(async (_request, { supabase, user }) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return apiNotFound("User profile");
  }

  return NextResponse.json(data);
});

// ══════════════════════════════════════════════════════════════
// PATCH /api/user — Update user profile (with field validation)
// ══════════════════════════════════════════════════════════════

export const PATCH = withAuth(
  async (request, { supabase, user }) => {
    const body = await request.json();

    // Only allow whitelisted fields
    const updateData: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      name: "name",
      full_name: "full_name",
      niche: "niche",
      brand_voice: "brand_voice",
      target_audience: "target_audience",
      goals: "goals",
      keywords: "keywords",
      onboarded: "onboarded",
    };

    for (const [clientKey, dbKey] of Object.entries(fieldMap)) {
      if (body[clientKey] !== undefined) {
        const validationError = validateField(dbKey, body[clientKey]);
        if (validationError) {
          return apiValidationError(validationError);
        }
        updateData[dbKey] = body[clientKey];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return apiValidationError("No valid fields to update");
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  },
  {
    rateLimit: { limit: 20, windowMs: 60_000 },
    rateLimitKey: "user:PATCH",
    auditAction: "update_user",
  }
);
