// POST /api/video/story - AI script generator using Groq (Llama 3.3 70B)
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { generateVideoScript } from "@/lib/ai-generate";

export const POST = withAuth(async (request, { profile }) => {
  const body = await request.json();
  const { niche, topic, style, duration } = body;
  const userNiche = niche || (profile?.niche as string) || "general";
  const userTopic = topic || "interesting facts";
  const targetDuration = duration || 30;

  try {
    const script = await generateVideoScript(userTopic, userNiche, style || "educational", targetDuration);
    return NextResponse.json({ script, method: "groq" });
  } catch (error) {
    return NextResponse.json({ error: `AI generation failed: ${error instanceof Error ? error.message : "Unknown"}` }, { status: 500 });
  }
}, {
  rateLimit: { limit: 20, windowMs: 60 * 60 * 1000 },
  rateLimitKey: "video:story",
  requireCredits: 2,
});
