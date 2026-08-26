// ══════════════════════════════════════════════════════════════
// TIKTOK ADAPTER
// Uses TikTok Content Posting API
// Docs: https://developers.tiktok.com/doc/content-posting-api
// Note: TikTok API requires approved developer account.
// Text-only posts not supported — requires video media.
// ══════════════════════════════════════════════════════════════

import { registerAdapter, type PlatformAdapter, type PublishResult } from "@/lib/publish";

const TIKTOK_API = "https://open.tiktokapis.com/v2";

const adapter: PlatformAdapter = {
  name: "tiktok",

  async publish({ content, hashtags, accessToken, mediaUrls }): Promise<PublishResult> {
    try {
      // TikTok requires video — no text-only posts
      if (!mediaUrls || mediaUrls.length === 0) {
        return {
          success: false,
          error: "TikTok requires at least one video. Add a video to this post.",
        };
      }

      const caption = [
        content.slice(0, 2200), // TikTok caption limit
        hashtags.length > 0 ? "\n" + hashtags.slice(0, 10).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ") : "",
      ].join("");

      const response = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_info: {
            title: caption.slice(0, 150),
            privacy_level: "PUBLIC_TO_EVERYONE",
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: "FILE_UPLOAD",
            video_size: 0, // Will be determined by server
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `TikTok API error ${response.status}: ${JSON.stringify(error)}`,
        };
      }

      const data = await response.json();
      const publishId = data?.data?.publish_id;

      return {
        success: true,
        platformPostId: publishId,
      };
    } catch (error) {
      return {
        success: false,
        error: `TikTok publish failed: ${error instanceof Error ? error.message : "Unknown"}`,
      };
    }
  },

  async refreshToken(refreshToken) {
    try {
      const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_key: process.env.TIKTOK_CLIENT_KEY || "",
          client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      const result = data?.data;
      return {
        accessToken: result?.access_token,
        refreshToken: result?.refresh_token,
        expiresAt: new Date(Date.now() + (result?.expires_in || 86400) * 1000),
      };
    } catch {
      return null;
    }
  },
};

registerAdapter("tiktok", () => adapter);
