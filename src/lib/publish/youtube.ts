// ══════════════════════════════════════════════════════════════
// YOUTUBE ADAPTER
// Uses YouTube Data API v3
// Docs: https://developers.google.com/youtube/v3/docs/videos/insert
// Note: YouTube API is primarily for video uploads.
// For community posts, use the YouTube Community API.
// ══════════════════════════════════════════════════════════════

import { registerAdapter, type PlatformAdapter, type PublishResult } from "@/lib/publish";

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";

const adapter: PlatformAdapter = {
  name: "youtube",

  async publish({ content, title, hashtags, accessToken, mediaUrls }): Promise<PublishResult> {
    try {
      // YouTube community posts use the Community endpoint
      // For video uploads, you need multipart upload which is complex
      // For now, support community posts (text-based)

      let postText = content;
      if (hashtags.length > 0) {
        postText += "\n\n" + hashtags.slice(0, 15).join(" ");
      }

      const response = await fetch(
        `${YOUTUBE_API}/communityPosts?part=snippet`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: {
              channelId: "", // Needs to be resolved from access token
              textMessageDetails: {
                messageText: postText,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `YouTube API error ${response.status}: ${JSON.stringify(error)}`,
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
        error: `YouTube publish failed: ${error instanceof Error ? error.message : "Unknown"}`,
      };
    }
  },

  async refreshToken(refreshToken) {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.GOOGLE_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      };
    } catch {
      return null;
    }
  },
};

registerAdapter("youtube", () => adapter);
