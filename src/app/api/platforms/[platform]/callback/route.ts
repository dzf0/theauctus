// ══════════════════════════════════════════════════════════════
// GET /api/platforms/[platform]/callback
//
// Handles the OAuth callback from the platform.
// Exchanges the authorization code for access/refresh tokens,
// then saves them to the connected_platforms table.
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface TokenExchangeConfig {
  tokenUrl: string;
  buildBody: (code: string, callbackUrl: string) => Record<string, string>;
  clientId: string;
  clientSecret: string;
  extractUser?: (tokenResponse: Record<string, unknown>) => Promise<{ platformUserId?: string; platformName?: string; accessToken: string } | null>;
}

const TOKEN_CONFIGS: Record<string, TokenExchangeConfig> = {
  twitter: {
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    clientId: process.env.TWITTER_CLIENT_ID || "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
    buildBody: (code, callbackUrl) => ({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
      client_id: process.env.TWITTER_CLIENT_ID || "",
    }),
    extractUser: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token as string;
      // Get user info
      const res = await fetch("https://api.twitter.com/2/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      return {
        platformUserId: data?.data?.id,
        platformName: data?.data?.username,
        accessToken,
      };
    },
  },
  linkedin: {
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    clientId: process.env.LINKEDIN_CLIENT_ID || "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
    buildBody: (code, callbackUrl) => ({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
      client_id: process.env.LINKEDIN_CLIENT_ID || "",
      client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
    }),
    extractUser: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token as string;
      const res = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      return {
        platformUserId: data?.sub,
        platformName: data?.name,
        accessToken,
      };
    },
  },
  facebook: {
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    clientId: process.env.FACEBOOK_APP_ID || "",
    clientSecret: process.env.FACEBOOK_APP_SECRET || "",
    buildBody: (code, callbackUrl) => ({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
      client_id: process.env.FACEBOOK_APP_ID || "",
      client_secret: process.env.FACEBOOK_APP_SECRET || "",
    }),
  },
  instagram: {
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    clientId: process.env.FACEBOOK_APP_ID || "",
    clientSecret: process.env.FACEBOOK_APP_SECRET || "",
    buildBody: (code, callbackUrl) => ({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
      client_id: process.env.FACEBOOK_APP_ID || "",
      client_secret: process.env.FACEBOOK_APP_SECRET || "",
    }),
  },
  threads: {
    tokenUrl: "https://graph.threads.net/v1.0/access_token",
    clientId: process.env.THREADS_APP_ID || "",
    clientSecret: process.env.THREADS_APP_SECRET || "",
    buildBody: (code, callbackUrl) => ({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
      client_id: process.env.THREADS_APP_ID || "",
      client_secret: process.env.THREADS_APP_SECRET || "",
    }),
    extractUser: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token as string;
      const res = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username&access_token=${accessToken}`);
      const data = await res.json();
      return {
        platformUserId: data?.id,
        platformName: data?.username,
        accessToken,
      };
    },
  },
  youtube: {
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    buildBody: (code, callbackUrl) => ({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    extractUser: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token as string;
      const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      return {
        platformUserId: data?.id,
        platformName: data?.name,
        accessToken,
      };
    },
  },
  tiktok: {
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    clientId: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    buildBody: (code, callbackUrl) => ({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
      client_key: process.env.TIKTOK_CLIENT_KEY || "",
      client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
    }),
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // user ID
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${url.origin}/settings?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${url.origin}/settings?error=missing_parameters`
    );
  }

  const config = TOKEN_CONFIGS[platform];
  if (!config) {
    return NextResponse.redirect(
      `${url.origin}/settings?error=unsupported_platform`
    );
  }

  try {
    // Exchange code for tokens
    const callbackUrl = `${url.origin}/api/platforms/${platform}/callback`;
    const body = config.buildBody(code, callbackUrl);

    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json().catch(() => ({}));
      console.error(`[${platform}] Token exchange failed:`, tokenError);
      return NextResponse.redirect(
        `${url.origin}/settings?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();

    // Extract user info if the adapter supports it
    let platformUserId = "";
    let platformName = "";
    let accessToken = tokenData.access_token;

    if (config.extractUser) {
      const userInfo = await config.extractUser(tokenData);
      if (userInfo) {
        platformUserId = userInfo.platformUserId || "";
        platformName = userInfo.platformName || "";
        accessToken = userInfo.accessToken;
      }
    }

    // Save to database
    const supabase = createSupabaseAdminClient();
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    await supabase
      .from("connected_platforms")
      .upsert(
        {
          user_id: state,
          platform,
          access_token: accessToken,
          refresh_token: tokenData.refresh_token || null,
          token_expires_at: expiresAt,
          platform_user_id: platformUserId,
          platform_name: platformName,
          connected: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,platform" }
      );

    return NextResponse.redirect(
      `${url.origin}/settings?connected=${platform}`
    );
  } catch (error) {
    console.error(`[${platform}] Callback error:`, error);
    return NextResponse.redirect(
      `${url.origin}/settings?error=connection_failed`
    );
  }
}
