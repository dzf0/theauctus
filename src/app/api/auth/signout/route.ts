import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// Fix #12: POST only — GET is CSRF-exploitable via <img> tags
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/`);
}
