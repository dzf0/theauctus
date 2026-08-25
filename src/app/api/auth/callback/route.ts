import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";

  // Fix #1: Prevent open redirect — only allow internal relative paths
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    next = "/dashboard";
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // Detect Google sign-in: if user has no username set yet (Google users
      // don't pass username in metadata), redirect to username picker.
      const provider = user.app_metadata?.provider;
      const hasUsername = user.user_metadata?.username;

      if (provider === "google" && !hasUsername) {
        return NextResponse.redirect(`${origin}/auth/username`);
      }

      // Check if user has completed onboarding
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarded")
          .eq("id", user.id)
          .maybeSingle();

        if (profile && !profile.onboarded) {
          return NextResponse.redirect(`${origin}/auth/pricing`);
        }
      } catch {
        // DB error — fall through to default redirect
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/callback-error`);
}
