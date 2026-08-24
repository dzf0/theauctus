import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Fix #10: Allowed fields and validation rules
const ALLOWED_UPDATE_FIELDS = [
  "niche",
  "brand_voice",
  "tone_preferences",
  "target_audience",
  "content_goals",
  "posting_frequency",
  "onboarded",
  "example_posts",
] as const;

const VALID_VOICES = ["professional", "casual", "humorous", "inspirational", "educational"];
const VALID_FREQUENCIES = ["daily", "3-5x-week", "1-2x-week", "weekly"];

function validateProfileField(key: string, value: unknown): string | null {
  if (typeof value === "string" && value.length > 2000) {
    return `${key} is too long (max 2000 characters)`;
  }
  if (Array.isArray(value) && value.length > 20) {
    return `${key} has too many items (max 20)`;
  }
  if (key === "brand_voice" && typeof value === "string" && !VALID_VOICES.includes(value)) {
    return "Invalid brand voice";
  }
  if (key === "posting_frequency" && typeof value === "string" && !VALID_FREQUENCIES.includes(value)) {
    return "Invalid posting frequency";
  }
  if (key === "onboarded" && typeof value !== "boolean") {
    return "onboarded must be a boolean";
  }
  return null;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ profile: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

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
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!tonePreferences || tonePreferences.length === 0) {
    return NextResponse.json({ error: "Select at least one tone preference" }, { status: 400 });
  }

  if (!contentGoals || contentGoals.length === 0) {
    return NextResponse.json({ error: "Select at least one content goal" }, { status: 400 });
  }

  // Fix #10: Server-side validation
  const voiceError = validateProfileField("brand_voice", brandVoice);
  if (voiceError) return NextResponse.json({ error: voiceError }, { status: 400 });

  const freqError = validateProfileField("posting_frequency", postingFrequency);
  if (freqError) return NextResponse.json({ error: freqError }, { status: 400 });

  if (typeof niche === "string" && niche.length > 100) {
    return NextResponse.json({ error: "Niche is too long" }, { status: 400 });
  }

  if (typeof targetAudience === "string" && targetAudience.length > 500) {
    return NextResponse.json({ error: "Target audience is too long" }, { status: 400 });
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
}

// Fix #2: Whitelist fields in PUT — no mass assignment
export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  // Only allow known fields through
  const allowedUpdates: Record<string, unknown> = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (body[key] !== undefined) {
      const validationError = validateProfileField(key, body[key]);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
      allowedUpdates[key] = body[key];
    }
  }

  if (Object.keys(allowedUpdates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
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
}
