import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Fix #7: Server-side username check with rate limiting
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username } = body;

  if (!username || typeof username !== "string") {
    return NextResponse.json({ available: false }, { status: 400 });
  }

  // Rate limit: 20 checks per minute per IP (prevent enumeration)
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`username-check:${ip}`, 20, 60_000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  return NextResponse.json({ available: !data });
}
