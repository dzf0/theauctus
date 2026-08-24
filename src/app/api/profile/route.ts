import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const { error } = await supabase
    .from("profiles")
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Profile updated successfully" });
}
