// POST /api/video/story - AI script generator for short-form video
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export const POST = withAuth(async (request, { profile }) => {
  const body = await request.json();
  const { niche, topic, style, duration } = body;
  const userNiche = niche || (profile?.niche as string) || "general";
  const targetDuration = duration || 30;
  const targetWords = Math.round(targetDuration * 2.5);

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "your-anthropic-api-key") {
    const scripts = [
      `Did you know that ${userNiche} is one of the fastest growing fields right now? Here are three things most people don't know. First, the market is expected to grow by 40 percent in the next two years. Second, top creators in this space are making six figures just from content. Third, the barrier to entry has never been lower. Follow for more.`,
      `Everyone talks about ${userNiche} but nobody tells you this. The real secret isn't about working harder. It's about working smarter. Here's what the top 1 percent do differently. They focus on systems, not goals. They automate everything they can. And they never stop learning. Save this for later.`,
    ];
    return NextResponse.json({ script: scripts[Math.floor(Math.random() * scripts.length)], method: "fallback" });
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const prompt = `Write a short-form video script (${targetWords} words, ~${targetDuration}s) about "${topic || "interesting facts"}" in the ${userNiche} niche. Style: ${style || "educational"}. Start with a hook. Write for spoken word. No hashtags or emojis. End with CTA. Return ONLY the script.`;
    const response = await client.messages.create({ model: "claude-3-5-haiku-20241022", max_tokens: 1000, messages: [{ role: "user", content: prompt }] });
    const script = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ script, method: "claude" });
  } catch {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}, { rateLimit: { limit: 10, windowMs: 60 * 60 * 1000 }, rateLimitKey: "video:story", requireCredits: 2 });
