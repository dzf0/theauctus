// ══════════════════════════════════════════════════════════════
// INSTAGRAM ADAPTER
// Uses Instagram Graph API (via Meta)
// Requires: Business/Creator account + Facebook Page linked
// Docs: https://developers.facebook.com/docs/instagram-api/posts
// ══════════════════════════════════════════════════════════════

import { registerAdapter, type PlatformAdapter, type PublishResult } from "@/lib/publish";

const GRAPH_API = "https://graph.facebook.com/v19.0";

const adapter: PlatformAdapter = {
  name: "instagram",

  async publish({ content, hashtags, accessToken, platformUserId, mediaUrls }): Promise<PublishResult> {
    try {
      const caption = [
        content,
        hashtags.length > 0 ? "\n\n" + hashtags.slice(0, 30).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ") : "",
      ].join("");

      // Instagram requires a two-step publish for media posts
      if (mediaUrls && mediaUrls.length > 0) {
        // Step 1: Create media container
        const mediaUrl = mediaUrls[0];
        const isVideo = mediaUrl.match(/\.(mp4|mov|avi)$/i);

        const createResponse = await fetch(`${GRAPH_API}/${platformUserId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [isVideo ? "video_url" : "image_url"]: mediaUrl,
            caption,
            access_token: accessToken,
          }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.json().catch(() => ({}));
          return { success: false, error: `Instagram media create failed: ${JSON.stringify(error)}` };
        }

        const createData = await createResponse.json();
        const containerId = createData?.id;

        // Step 2: Wait for processing, then publish
        // In production, you'd poll for status. For now, short delay.
        await new Promise((r) => setTimeout(r, 3000));

        const publishResponse = await fetch(`${GRAPH_API}/${platformUserId}/media_publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: accessToken,
          }),
        });

        if (!publishResponse.ok) {
          const error = await publishResponse.json().catch(() => ({}));
          return { success: false, error: `Instagram publish failed: ${JSON.stringify(error)}` };
        }

        const publishData = await publishResponse.json();
        return {
          success: true,
          platformPostId: publishData?.id,
        };
      }

      // Text-only posts not supported on Instagram — need media
      return {
        success: false,
        error: "Instagram requires at least one image or video. Add media to this post.",
      };
    } catch (error) {
      return {
        success: false,
        error: `Instagram publish failed: ${error instanceof Error ? error.message : "Unknown"}`,
      };
    }
  },

  async refreshToken(refreshToken) {
    // Same flow as Facebook — Instagram uses Meta's OAuth
    try {
      const response = await fetch(
        `${GRAPH_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${refreshToken}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      };
    } catch {
      return null;
    }
  },
};

registerAdapter("instagram", () => adapter);
