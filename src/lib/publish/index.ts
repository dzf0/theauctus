// ══════════════════════════════════════════════════════════════
// PUBLISH ADAPTERS INDEX
// Import all platform adapters to register them.
// Import this file wherever publishPost() is called.
// ══════════════════════════════════════════════════════════════

import "@/publish/twitter";
import "@/publish/linkedin";
import "@/publish/facebook";
import "@/publish/instagram";
import "@/publish/threads";
import "@/publish/youtube";
import "@/publish/tiktok";
import "@/publish/blog";

export { publishPost, publishScheduledPosts } from "@/lib/publish";
