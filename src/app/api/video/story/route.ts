// POST /api/video/story - AI script generator using Gemini 3.6 Flash
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { generateVideoScript } from "@/lib/ai-generate";
import { deductCredits } from "@/lib/credits";

export const POST = withAuth(async (request, { user, profile }) => {
  const body = await request.json();
  const { niche, topic, style, duration } = body;
  const userNiche = niche || (profile?.niche as string) || "general";
  const userTopic = topic || "interesting facts";
  const targetDuration = duration || 30;

  console.log(`[video/story] Request: topic=${userTopic}, niche=${userNiche}, style=${style}, duration=${targetDuration}`);

  const CREDIT_COST = 2;

  try {
    const result = await generateVideoScript(userTopic, userNiche, style || "educational", targetDuration);

    console.log(`[video/story] Script generated: ${result.script.split(/\s+/).length} words (method: ${result.method})`);

    // Only deduct credits for real AI-generated scripts, not fallback templates
    if (result.isFallback) {
      console.log("[video/story] Fallback template used — no credits charged");
      return NextResponse.json({
        script: result.script,
        method: result.method,
        creditsDeducted: 0,
        newBalance: undefined,
      });
    }

    // Deduct credits after successful generation (admins exempt)
    const deductResult = await deductCredits(
      user,
      CREDIT_COST,
      `Generated video script: "${userTopic}"`
    );
    if (!deductResult.success) {
      console.error("[video/story] Credit deduction failed:", deductResult.error);
    }

    return NextResponse.json({
      script: result.script,
      method: result.method,
      creditsDeducted: CREDIT_COST,
      newBalance: deductResult.balance,
    });
  } catch (error) {
    console.error("[video/story] Generation error:", error);
    return NextResponse.json({ error: `AI generation failed: ${error instanceof Error ? error.message : "Unknown"}` }, { status: 500 });
  }
}, {
  rateLimit: { limit: 20, windowMs: 60 * 60 * 1000 },
  rateLimitKey: "video:story",
  requireCredits: 2,
});
