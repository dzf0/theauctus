import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const provider = searchParams.get("provider") || "google";
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  
  const supabase = await createSupabaseServerClient();
  
  // Map provider names to Supabase provider IDs
  const providerMap: Record<string, string> = {
    google: "google",
    apple: "apple",
    facebook: "facebook",
  };

  const supabaseProvider = providerMap[provider] || "google";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: supabaseProvider as "google" | "apple" | "facebook",
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${redirectTo}`,
    },
  });

  if (error) {
    return NextResponse.redirect(`${origin}/auth/error?message=${error.message}`);
  }

  return NextResponse.redirect(data.url);
}
