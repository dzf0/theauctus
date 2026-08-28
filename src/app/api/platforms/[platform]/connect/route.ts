// ══════════════════════════════════════════════════════════════
// GET /api/platforms/[platform]/connect
//
// Starts the OAuth flow for connecting a social platform.
// Redirects the user to the platform's authorization page.
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const OAUTH_CONFIGS: Record<string, {
  authUrl: string;
  clientId: string;
  scopes: string;
  additionalParams?: Record<string, string>;
}> = {
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    clientId: process.env.TWITTER_CLIENT_ID || "",
    scopes: "tweet.read tweet.write users.read offline.access",
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    clientId: process.env.LINKEDIN_CLIENT_ID || "",
    scopes: "w_member_social r_liteprofile r_emailaddress",
  },
  facebook: {
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    clientId: process.env.FACEBOOK_APP_ID || "",
    scopes: "pages_manage_posts pages_show_list public_profile",
  },
  instagram: {
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    clientId: process.env.FACEBOOK_APP_ID || "",
    scopes: "pages_manage_posts instagram_basic instagram_content_publish",
  },
  threads: {
    authUrl: "https://threads.net/oauth/authorize",
    clientId: process.env.THREADS_APP_ID || "",
    scopes: "threads_basic threads_content_publish",
  },
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    scopes: "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl",
    additionalParams: { access_type: "offline", prompt: "consent" },
  },
  tiktok: {
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    clientId: process.env.TIKTOK_CLIENT_KEY || "",
    scopes: "user.info.basic video.publish",
    additionalParams: { response_type: "code" },
  },
  blog: {
    authUrl: "", // WordPress uses Application Passwords, not OAuth
    clientId: "",
    scopes: "",
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;

  // Require authentication
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = OAUTH_CONFIGS[platform];
  if (!config || !config.authUrl) {
    return NextResponse.json({ error: `Platform ${platform} not supported` }, { status: 400 });
  }

  // Build the callback URL
  const origin = new URL(request.url).origin;
  const callbackUrl = `${origin}/api/platforms/${platform}/callback`;

  // Build the authorization URL
  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", callbackUrl);
  authUrl.searchParams.set("scope", config.scopes);
  authUrl.searchParams.set("state", user.id); // Pass user ID as state

  if (config.additionalParams) {
    for (const [key, value] of Object.entries(config.additionalParams)) {
      authUrl.searchParams.set(key, value);
    }
  }

  // Twitter uses response_type=code, others too
  if (platform !== "facebook" && platform !== "instagram") {
    authUrl.searchParams.set("response_type", "code");
  }

  return NextResponse.redirect(authUrl.toString());
}
