// ══════════════════════════════════════════════════════════════
// POST /api/cron/publish
//
// Cron-triggered endpoint that publishes scheduled posts.
// Call this every 1-5 minutes from an external cron service
// (Vercel Cron, cron-job.org, etc.)
//
// Secured by CRON_SECRET — only accepts requests with the
// correct Authorization header.
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import "@/lib/publish/index"; // Register all adapters
import { publishScheduledPosts } from "@/lib/publish";

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await publishScheduledPosts();

    console.log(
      `[CRON] Published: ${result.published}, Failed: ${result.failed}, Skipped: ${result.skipped}`
    );

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Publish error:", error);
    return NextResponse.json(
      { error: "Publish cron failed" },
      { status: 500 }
    );
  }
}

// Also support GET for health checks
export async function GET() {
  return NextResponse.json({ status: "ok", service: "publish-cron" });
}
