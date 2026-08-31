// POST /api/video/reddit — Fetch a Reddit post and generate a video script from it
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { generateVideoScript } from "@/lib/ai-generate";
import { deductCredits } from "@/lib/credits";

export const POST = withAuth(async (request, { user, profile }) => {
  const body = await request.json();
  const { url, duration, captionStyleId } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Reddit URL is required" }, { status: 400 });
  }

  // Validate Reddit URL format
  const redditMatch = url.match(/(?:reddit\.com|r\.scot)\/r\/(\w+)\/comments\/(\w+)/);
  if (!redditMatch) {
    return NextResponse.json({ error: "Invalid Reddit URL. Must be a post link like https://reddit.com/r/subreddit/comments/..." }, { status: 400 });
  }

  const targetDuration = duration || 60;

  try {
    // Fetch Reddit post via JSON API (no auth needed)
    // Append .json to the URL to get structured data
    const jsonUrl = url.endsWith(".json") ? url : url.replace(/\/$/, "") + ".json";
    const res = await fetch(jsonUrl, {
      headers: { "User-Agent": "TheAuctus/1.0 (content creator tool)" },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch Reddit post (${res.status}). Make sure the URL is valid and the post is public.` }, { status: 402 });
    }

    const data = await res.json();

    // Reddit JSON API returns [post listing, comments]
    const post = data?.[0]?.data?.children?.[0]?.data;
    if (!post) {
      return NextResponse.json({ error: "Could not parse Reddit post" }, { status: 400 });
    }

    const title = post.title || "";
    const selftext = post.selftext || "";
    const subreddit = post.subreddit || "";
    const author = post.author || "someone";
    const ups = post.ups || 0;
    const numComments = post.num_comments || 0;

    // Get top comments for richer script
    const comments = (data?.[1]?.data?.children || [])
      .filter((c: { kind?: string }) => c.kind === "t1")
      .slice(0, 5)
      .map((c: { data: { body?: string; author?: string; ups?: number } }) => ({
        author: c.data?.author || "user",
        body: (c.data?.body || "").substring(0, 300),
        ups: c.data?.ups || 0,
      }));

    const commentsText = comments.length > 0
      ? "\n\nTop comments:\n" + comments.map((c: { author: string; ups: number; body: string }) => `- u/${c.author} (${c.ups} upvotes): ${c.body}`).join("\n")
      : "";

    // Build context for AI script generation
    const redditContext = `Reddit post from r/${subreddit} by u/${author} (${ups} upvotes, ${numComments} comments):

Title: "${title}"
${selftext ? `\nBody:\n${selftext.substring(0, 1500)}` : ""}${commentsText}`;

    console.log(`[video/reddit] Fetched post: "${title.substring(0, 60)}..." from r/${subreddit}`);

    // Generate a script from the Reddit content using Gemini
    const script = await generateVideoScript(
      redditContext,
      profile?.niche as string || "general",
      "storytelling",
      targetDuration
    );

    console.log(`[video/reddit] Script generated: ${script.split(/\s+/).length} words`);

    // Deduct credits
    const CREDIT_COST = 2;
    const deductResult = await deductCredits(
      user,
      CREDIT_COST,
      `Reddit video script: "${title.substring(0, 50)}"`
    );

    return NextResponse.json({
      success: true,
      script,
      redditPost: {
        title,
        subreddit,
        author,
        ups,
        numComments,
        url,
      },
      creditsDeducted: CREDIT_COST,
      newBalance: deductResult.balance,
    });
  } catch (error) {
    console.error("[video/reddit] Error:", error);
    return NextResponse.json(
      { error: `Failed to process Reddit post: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}, {
  rateLimit: { limit: 10, windowMs: 60 * 60 * 1000 },
  rateLimitKey: "video:reddit",
  requireCredits: 2,
  auditAction: "reddit_video_script",
});
