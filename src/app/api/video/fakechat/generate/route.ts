// POST /api/video/fakechat/generate — AI generates a fake text chat conversation from a topic
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";

const GEMINI_API_KEY = () => process.env.GEMINI_API_KEY;
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const { topic, style, messageCount } = body;

  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const apiKey = GEMINI_API_KEY();
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const numMessages = Math.min(Math.max(messageCount || 10, 4), 20);
  const chatStyle = style || "funny";

  const styleDescriptions: Record<string, string> = {
    funny: "A hilarious, dramatic conversation with unexpected twists. Make it entertaining and shareable.",
    horror: "A creepy, unsettling conversation that builds tension. Like a thriller movie in text form.",
    drama: "An intense emotional conversation with conflict and resolution. Soap opera energy.",
    romance: "A sweet/flirty conversation between two people. Include nervous energy and witty banter.",
    wholesome: "A heartwarming, feel-good conversation. Pure wholesome content.",
    revenge: "A satisfying revenge story told through texts. The underdog wins.",
    shocking: "A jaw-dropping conversation with plot twists nobody sees coming.",
    relatable: "A painfully relatable everyday conversation that everyone can connect with.",
  };

  const prompt = `Generate a fake text message conversation for a short-form video (TikTok/Reels/Shorts).

TOPIC: "${topic}"
STYLE: ${chatStyle} — ${styleDescriptions[chatStyle] || styleDescriptions.funny}

RULES:
- Generate exactly ${numMessages} messages
- Alternate between "left" (the other person) and "right" (the main character / you)
- Each message should be 1-3 sentences (realistic text message length)
- Make it ENGAGING — hooks, tension, payoff. This is for viral short-form video.
- Start with something that grabs attention immediately
- End with a memorable moment (funny, shocking, or wholesome)
- Use natural texting language — abbreviations, lowercase, no punctuation sometimes
- NO emojis in the messages (we'll add visual elements separately)
- The conversation should flow naturally like real texts
- "right" messages are the main character's side (they get voiceover)

Return ONLY a JSON array. Each element:
{
  "sender": "left" or "right",
  "text": "The message text"
}

Return ONLY the JSON array. No markdown, no explanation.`;

  try {
    const response = await fetch(`${GEMINI_API}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (response.status === 429) {
      return NextResponse.json({ error: "Gemini API rate limited. Try again in a minute." }, { status: 429 });
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({ error: `Gemini API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    // Parse JSON from response (handle markdown fences)
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    let messages;
    try {
      messages = JSON.parse(jsonStr);
    } catch {
      // Try to extract JSON array from the text
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        messages = JSON.parse(match[0]);
      } else {
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
      }
    }

    if (!Array.isArray(messages) || messages.length < 2) {
      return NextResponse.json({ error: "AI generated too few messages" }, { status: 500 });
    }

    // Validate and clean messages
    const cleaned = messages
      .filter((m: { sender?: string; text?: string }) => m.sender && m.text)
      .map((m: { sender: string; text: string }) => ({
        sender: m.sender === "left" || m.sender === "right" ? m.sender : "left",
        text: String(m.text).trim(),
      }))
      .slice(0, numMessages);

    return NextResponse.json({
      messages: cleaned,
      topic,
      style: chatStyle,
    });
  } catch (error) {
    console.error("[fakechat/generate] Error:", error);
    return NextResponse.json(
      { error: `AI generation failed: ${error instanceof Error ? error.message : "Unknown"}` },
      { status: 500 }
    );
  }
}, {
  rateLimit: { limit: 15, windowMs: 60 * 60 * 1000 },
  rateLimitKey: "fakechat:generate",
});
