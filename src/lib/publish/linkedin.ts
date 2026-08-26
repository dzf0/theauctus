// ══════════════════════════════════════════════════════════════
// LINKEDIN ADAPTER
// Uses LinkedIn Marketing API (Share on LinkedIn)
// Docs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
// ══════════════════════════════════════════════════════════════

import { registerAdapter, type PlatformAdapter, type PublishResult } from "@/lib/publish";

const LINKEDIN_API = "https://api.linkedin.com/v2";

const adapter: PlatformAdapter = {
  name: "linkedin",

  async publish({ content, hashtags, accessToken, platformUserId }): Promise<PublishResult> {
    try {
      // Build the post text
      let text = content;
      if (hashtags.length > 0) {
        const hashtagStr = "\n\n" + hashtags.slice(0, 5).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
        text += hashtagStr;
      }

      // LinkedIn requires the person URN
      const authorUrn = `urn:li:person:${platformUserId}`;

      const response = await fetch(`${LINKEDIN_API}/ugcPosts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: authorUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `LinkedIn API error ${response.status}: ${JSON.stringify(error)}`,
        };
      }

      const data = await response.json();
      const postId = data?.id;

      return {
        success: true,
        platformPostId: postId,
      };
    } catch (error) {
      return {
        success: false,
        error: `LinkedIn publish failed: ${error instanceof Error ? error.message : "Unknown"}`,
      };
    }
  },

  async refreshToken(refreshToken) {
    try {
      const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.LINKEDIN_CLIENT_ID || "",
          client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
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

registerAdapter("linkedin", () => adapter);
