import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";

  // Prevent open redirect — only allow internal relative paths
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    next = "/dashboard";
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      const provider = user.app_metadata?.provider;

      // For Google users: sync their real name and email into the profile
      if (provider === "google") {
        const admin = createSupabaseAdminClient();

        // Google provides name in user_metadata
        const googleName = user.user_metadata?.full_name
          || user.user_metadata?.name
          || "";
        const googleEmail = user.email || "";

        // Upsert profile with Google data (only update if fields are empty)
        const { data: existingProfile } = await admin
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();

        const updates: Record<string, unknown> = {};

        // Only set if currently empty — don't overwrite user's edits
        if (!existingProfile?.full_name && googleName) {
          updates.full_name = googleName;
          updates.name = googleName;
        }
        if (!existingProfile?.email && googleEmail) {
          updates.email = googleEmail;
        }

        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          await admin
            .from("profiles")
            .update(updates)
            .eq("id", user.id);
        }

        // Check if user has a real username (not auto-generated from email)
        const { data: profile } = await admin
          .from("profiles")
          .select("username, full_name, onboarded")
          .eq("id", user.id)
          .single();

        // If no username set, or no full name, go to username picker
        if (profile && !profile.full_name) {
          return NextResponse.redirect(`${origin}/auth/username`);
        }

        // If not onboarded, go to pricing flow
        if (profile && !profile.onboarded) {
          return NextResponse.redirect(`${origin}/auth/pricing`);
        }

        // Fully onboarded — go to dashboard
        return NextResponse.redirect(`${origin}/dashboard`);
      }

      // For email/password users: check onboarding status and username
      try {
        const admin = createSupabaseAdminClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("onboarded, full_name, username")
          .eq("id", user.id)
          .maybeSingle();

        // Not onboarded → pricing flow
        if (profile && !profile.onboarded) {
          return NextResponse.redirect(`${origin}/auth/pricing`);
        }

        // Onboarded but missing username/full_name → username picker
        if (profile && profile.onboarded && (!profile.full_name || !profile.username)) {
          return NextResponse.redirect(`${origin}/auth/username`);
        }
      } catch {
        // DB error — fall through to default redirect
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin`);
}
