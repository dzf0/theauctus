// ══════════════════════════════════════════════════════════════
// THREADS ADAPTER
// Uses Threads API by Meta
// Docs: https://developers.facebook.com/docs/threads/
// ══════════════════════════════════════════════════════════════

import { registerAdapter, type PlatformAdapter, type PublishResult } from "@/lib/publish";

const THREADS_API = "https://graph.threads.net/v1.0";

const adapter: PlatformAdapter = {
  name: "threads",

  async publish({ content, hashtags, accessToken, platformUserId }): Promise<PublishResult> {
    try {
      let text = content;
      if (hashtags.length > 0) {
        const hashtagStr = "\n\n" + hashtags.slice(0, 5).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
        text += hashtagStr;
      }

      // Step 1: Create media container
      const createResponse = await fetch(`${THREADS_API}/${platformUserId}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "TEXT",
          text,
          access_token: accessToken,
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json().catch(() => ({}));
        return { success: false, error: `Threads container create failed: ${JSON.stringify(error)}` };
      }

      const createData = await createResponse.json();
      const containerId = createData?.id;

      // Step 2: Publish
      const publishResponse = await fetch(`${THREADS_API}/${platformUserId}/threads_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      });

      if (!publishResponse.ok) {
        const error = await publishResponse.json().catch(() => ({}));
        return { success: false, error: `Threads publish failed: ${JSON.stringify(error)}` };
      }

      const publishData = await publishResponse.json();
      return {
        success: true,
        platformPostId: publishData?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: `Threads publish failed: ${error instanceof Error ? error.message : "Unknown"}`,
      };
    }
  },
};

registerAdapter("threads", () => adapter);
