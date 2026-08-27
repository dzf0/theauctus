// ══════════════════════════════════════════════════════════════
// PUBLISH ADAPTERS INDEX
// Import all platform adapters to register them.
// Import this file wherever publishPost() is called.
// ══════════════════════════════════════════════════════════════

import "@/lib/publish/twitter";
import "@/lib/publish/linkedin";
import "@/lib/publish/facebook";
import "@/lib/publish/instagram";
import "@/lib/publish/threads";
import "@/lib/publish/youtube";
import "@/lib/publish/tiktok";
import "@/lib/publish/blog";

export { publishPost, publishScheduledPosts } from "@/lib/publish";
