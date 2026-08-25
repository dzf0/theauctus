import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Fix #7: Server-side username check with rate limiting
// Uses the service-role client so RLS can't blind the query —
// the anon client sees zero profile rows under our RLS policies,
// which made every taken username look "available".

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username } = body;

  if (!username || typeof username !== "string" || !USERNAME_RE.test(username)) {
    return NextResponse.json({ available: false, reason: "invalid" }, { status: 400 });
  }

  // Rate limit: 20 checks per minute per IP (prevent enumeration)
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(`username-check:${ip}`, 20, 60_000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username) // case-insensitive: "Aashir" blocks "aashir"
      .maybeSingle();

    // Fail CLOSED: if the lookup errors, report unavailable rather than
    // letting a taken username through to fail signup with a 500.
    if (error) {
      console.error("check-username lookup failed:", error.message);
      return NextResponse.json({ available: false, reason: "error" }, { status: 503 });
    }

    return NextResponse.json({ available: !data });
  } catch (err) {
    console.error("check-username misconfigured:", err instanceof Error ? err.message : err);
    return NextResponse.json({ available: false, reason: "error" }, { status: 503 });
  }
}
