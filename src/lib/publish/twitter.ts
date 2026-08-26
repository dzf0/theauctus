// ══════════════════════════════════════════════════════════════
// TWITTER / X ADAPTER
// Uses Twitter API v2 with OAuth 2.0
// Docs: https://developer.x.com/en/docs/twitter-api/tweets/manage-tweets/introduction
// ══════════════════════════════════════════════════════════════

import { registerAdapter, type PlatformAdapter, type PublishResult } from "@/lib/publish";

const TWITTER_API = "https://api.twitter.com/2";

const adapter: PlatformAdapter = {
  name: "twitter",

  async publish({ content, hashtags, accessToken }): Promise<PublishResult> {
    try {
      // Build tweet text — append hashtags at end
      let text = content.slice(0, 280); // Twitter char limit
      if (hashtags.length > 0) {
        const hashtagStr = " " + hashtags.slice(0, 5).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
        if (text.length + hashtagStr.length <= 280) {
          text += hashtagStr;
        }
      }

      const response = await fetch(`${TWITTER_API}/tweets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `Twitter API error ${response.status}: ${JSON.stringify(error)}`,
        };
      }

      const data = await response.json();
      const tweetId = data?.data?.id;

      return {
        success: true,
        platformPostId: tweetId,
        permalink: tweetId ? `https://x.com/i/status/${tweetId}` : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: `Twitter publish failed: ${error instanceof Error ? error.message : "Unknown"}`,
      };
    }
  },

  async refreshToken(refreshToken) {
    try {
      const response = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      };
    } catch {
      return null;
    }
  },
};

registerAdapter("twitter", () => adapter);
