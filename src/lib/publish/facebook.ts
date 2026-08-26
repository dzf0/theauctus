// ══════════════════════════════════════════════════════════════
// FACEBOOK ADAPTER
// Uses Meta Graph API
// Docs: https://developers.facebook.com/docs/pages-api/posts
// ══════════════════════════════════════════════════════════════

import { registerAdapter, type PlatformAdapter, type PublishResult } from "@/lib/publish";

const GRAPH_API = "https://graph.facebook.com/v19.0";

const adapter: PlatformAdapter = {
  name: "facebook",

  async publish({ content, hashtags, accessToken, platformUserId }): Promise<PublishResult> {
    try {
      let message = content;
      if (hashtags.length > 0) {
        const hashtagStr = "\n\n" + hashtags.slice(0, 5).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
        message += hashtagStr;
      }

      // platformUserId is the Facebook Page ID
      const response = await fetch(`${GRAPH_API}/${platformUserId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          access_token: accessToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `Facebook API error ${response.status}: ${JSON.stringify(error)}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        platformPostId: data?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: `Facebook publish failed: ${error instanceof Error ? error.message : "Unknown"}`,
      };
    }
  },

  async refreshToken(refreshToken) {
    try {
      const response = await fetch(
        `${GRAPH_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${refreshToken}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      // Facebook long-lived tokens last 60 days
      return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      };
    } catch {
      return null;
    }
  },
};

registerAdapter("facebook", () => adapter);
