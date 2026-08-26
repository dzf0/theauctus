// ══════════════════════════════════════════════════════════════
// BLOG ADAPTER (WordPress)
// Uses WordPress REST API
// Docs: https://developer.wordpress.org/rest-api/reference/posts/
// Requires: WordPress site with Application Passwords enabled
// ══════════════════════════════════════════════════════════════

import { registerAdapter, type PlatformAdapter, type PublishResult } from "@/lib/publish";

const adapter: PlatformAdapter = {
  name: "blog",

  async publish({ content, title, hashtags, accessToken, platformUserId }): Promise<PublishResult> {
    try {
      // platformUserId is the WordPress site URL (e.g., "https://blog.example.com")
      const siteUrl = platformUserId || process.env.WORDPRESS_SITE_URL || "";
      if (!siteUrl) {
        return { success: false, error: "WordPress site URL not configured" };
      }

      // Build HTML content from markdown-ish content
      let htmlContent = content
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br/>");
      htmlContent = `<p>${htmlContent}</p>`;

      // Add hashtags as tags
      const tags = hashtags.map((t) => t.replace(/^#/, ""));

      const response = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title || "Untitled Post",
          content: htmlContent,
          status: "publish",
          tags: [], // Tags need to be resolved by name first
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `WordPress API error ${response.status}: ${JSON.stringify(error)}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        platformPostId: String(data?.id),
        permalink: data?.link,
      };
    } catch (error) {
      return {
        success: false,
        error: `Blog publish failed: ${error instanceof Error ? error.message : "Unknown"}`,
      };
    }
  },
};

registerAdapter("blog", () => adapter);
