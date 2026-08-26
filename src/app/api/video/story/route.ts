// POST /api/video/story - AI script generator using Google Gemini (free)
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const POST = withAuth(async (request, { profile }) => {
  const body = await request.json();
  const { niche, topic, style, duration } = body;
  const userNiche = niche || (profile?.niche as string) || "general";
  const userTopic = topic || "interesting facts";
  const targetDuration = duration || 30;
  const targetWords = Math.round(targetDuration * 2.5);

  if (!GEMINI_API_KEY) {
    // Fallback: pre-written scripts personalized with niche
    const scripts = [
      `Did you know that ${userNiche} is one of the fastest growing fields right now? Here are three things most people don't know. First, the market is expected to grow by 40 percent in the next two years. Second, top creators in this space are making six figures just from content. Third, the barrier to entry has never been lower. If you're not paying attention to ${userNiche}, you're leaving money on the table. Follow for more.`,
      `Everyone talks about ${userNiche} but nobody tells you this. The real secret isn't about working harder. It's about working smarter. Here's what the top 1 percent do differently. They focus on systems, not goals. They automate everything they can. And they never stop learning. If you apply these three principles to your ${userNiche} journey, you'll see results in 30 days. Save this for later.`,
      `Here's a ${userNiche} tip that changed everything for me. Stop trying to do everything at once. Pick one platform. Master it. Then expand. I went from posting randomly to having a system that generates content automatically. The result? 10x more engagement in just 60 days. Try this and let me know how it goes.`,
      `Three ${userNiche} mistakes that are killing your growth. Number one: posting without a strategy. You need a content calendar. Number two: ignoring analytics. Your data tells you what works. Number three: trying to be everywhere at once. Pick two platforms and dominate them. Fix these and you'll see a massive difference. Follow for more tips.`,
      `The biggest lie in ${userNiche} is that you need to work harder. Nope. You need to work smarter. Here's the system I use. Batch create content one day per week. Schedule everything in advance. Engage with your audience for 15 minutes daily. That's it. Three simple habits that changed my entire ${userNiche} game. Try it for 30 days.`,
    ];
    const script = scripts[Math.floor(Math.random() * scripts.length)];
    return NextResponse.json({ script, method: "fallback", creditsUsed: 0 });
  }

  // Use Google Gemini to generate the script
  try {
    const prompt = `Write a short-form video script (${targetWords} words, about ${targetDuration} seconds) about "${userTopic}" in the ${userNiche} niche.

Style: ${style || "educational"}

Rules:
- Start with a hook that stops the scroll in the first 2 seconds
- Write for spoken word (conversational, natural rhythm)
- No hashtags, no emojis, no stage directions
- End with a call to action (follow, save, or share)
- Be specific and actionable, not generic
- Keep sentences short and punchy

Return ONLY the script text. No title, no explanation, no quotes around it.`;

    const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({ error: `Gemini API error: ${JSON.stringify(error)}` }, { status: 500 });
    }

    const data = await response.json();
    const script = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!script) {
      return NextResponse.json({ error: "Empty response from Gemini" }, { status: 500 });
    }

    return NextResponse.json({ script, method: "gemini" });
  } catch (error) {
    return NextResponse.json({ error: `AI generation failed: ${error instanceof Error ? error.message : "Unknown"}` }, { status: 500 });
  }
}, {
  rateLimit: { limit: 20, windowMs: 60 * 60 * 1000 },
  rateLimitKey: "video:story",
  requireCredits: 2,
});
