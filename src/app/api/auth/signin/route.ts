import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${redirectTo}`,
    },
  });

  if (error) {
    return NextResponse.redirect(`${origin}/auth/error?message=${error.message}`);
  }

  return NextResponse.redirect(data.url);
}
