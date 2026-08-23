import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getProfile } from "@/lib/auth-helpers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// GET /api/user — Get current user profile
export async function GET() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  return NextResponse.json(profile);
}

// PATCH /api/user — Update user profile
export async function PATCH(request: NextRequest) {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const body = await request.json();
  const { name, niche, brandVoice, targetAudience, goals, keywords, onboarded } = body;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...(name !== undefined && { name }),
      ...(niche !== undefined && { niche }),
      ...(brandVoice !== undefined && { brand_voice: brandVoice }),
      ...(targetAudience !== undefined && { target_audience: targetAudience }),
      ...(goals !== undefined && { goals }),
      ...(keywords !== undefined && { keywords }),
      ...(onboarded !== undefined && { onboarded }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
