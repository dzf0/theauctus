// ══════════════════════════════════════════════════════════════
// AI CONTENT GENERATION — Google Gemini
// Used by: /api/posts (batch generation), /api/video/story
// ══════════════════════════════════════════════════════════════

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface GeneratedPost {
  title: string;
  content: string;
  platform: string;
  contentType: string;
  hashtags: string[];
  scheduledAt: string | null;
}

export interface GeneratePostsOptions {
  topic: string;
  platforms: string[];
  count: number;
  niche?: string;
  brandVoice?: string;
  targetAudience?: string;
  tonePreferences?: string[];
}

/**
 * Generate social media posts using Gemini.
 * Returns an array of posts tailored to each platform.
 */
export async function generatePosts(opts: GeneratePostsOptions): Promise<GeneratedPost[]> {
  if (!GEMINI_API_KEY) {
    return generateFallbackPosts(opts);
  }

  const postsPerPlatform = Math.ceil(opts.count / opts.platforms.length);

  const prompt = `You are an expert social media content strategist.

TOPIC: "${opts.topic}"
NICHE: ${opts.niche || "General"}
BRAND VOICE: ${opts.brandVoice || "Professional, engaging, actionable"}
TARGET AUDIENCE: ${opts.targetAudience || "Creators and entrepreneurs"}
TONE: ${opts.tonePreferences?.join(", ") || "Friendly, informative"}

Generate exactly ${opts.count} social media posts across these platforms: ${opts.platforms.join(", ")}.
Each platform should get ~${postsPerPlatform} posts with content tailored to that platform's format and audience.

PLATFORM RULES:
- Twitter/X: Short, punchy, max 280 chars per tweet, use line breaks, threads OK (use \\n---\\n as separator)
- Instagram: Visual-first captions, 3-5 hashtags, emoji-friendly, hook-driven
- LinkedIn: Professional but conversational, data-backed, storytelling
- TikTok: Casual, trend-aware, hook in first 2 seconds of script
- Facebook: Community-oriented, question-driven, longer form
- YouTube: Educational, detailed, chapter timestamps
- Threads: Personal, conversational, like texting a smart friend
- Blog: Long-form, SEO-optimized, thorough

CONTENT MIX (spread across all posts):
- 30% Educational (tips, tutorials, how-tos)
- 25% Engagement (questions, polls, hot takes)
- 25% Social proof (results, milestones, behind-the-scenes)
- 20% Promotional (CTAs, product mentions)

RULES:
- Start every post with a scroll-stopping hook in the first line
- Include 3-5 relevant hashtags per post
- Make each post feel native to its platform (don't just cross-post)
- Be specific and actionable, not generic
- No fake engagement bait — provide real value

Return a JSON array. Each element:
{
  "title": "Short hook/headline (5-10 words)",
  "content": "Full post content with line breaks (use \\n for newlines)",
  "platform": "twitter|instagram|linkedin|tiktok|youtube|threads|facebook|blog",
  "contentType": "text|thread|carousel|video|reel|image|blog-post",
  "hashtags": ["tag1", "tag2", "tag3"]
}

Return ONLY the JSON array. No markdown, no explanation, no code fences.`;

  try {
    const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Parse JSON — handle markdown code fences if present
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    const posts = JSON.parse(jsonStr) as GeneratedPost[];

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error("Invalid response format from Gemini");
    }

    return posts;
  } catch (error) {
    console.error("Gemini generation failed:", error);
    // Fall back to template-based generation
    return generateFallbackPosts(opts);
  }
}

/**
 * Generate a single video script using Gemini.
 */
export async function generateVideoScript(
  topic: string,
  niche: string,
  style: string,
  duration: number
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return getFallbackScript(niche);
  }

  const targetWords = Math.round(duration * 2.5);

  const prompt = `Write a short-form video script (${targetWords} words, about ${duration} seconds) about "${topic}" in the ${niche} niche.

Style: ${style || "educational"}

Rules:
- Start with a hook that stops the scroll in the first 2 seconds
- Write for spoken word (conversational, natural rhythm)
- No hashtags, no emojis, no stage directions
- End with a call to action (follow, save, or share)
- Be specific and actionable, not generic
- Keep sentences short and punchy

Return ONLY the script text. No title, no explanation, no quotes around it.`;

  try {
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
      throw new Error(`Gemini API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const script = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!script) {
      throw new Error("Empty response from Gemini");
    }

    return script;
  } catch (error) {
    console.error("Gemini script generation failed:", error);
    return getFallbackScript(niche);
  }
}

// ── Fallback generators (when no API key) ─────────────────────

function generateFallbackPosts(opts: GeneratePostsOptions): GeneratedPost[] {
  const posts: GeneratedPost[] = [];
  const now = new Date();

  const hooks = [
    `The ${opts.topic} strategy nobody talks about:`,
    `I tested ${opts.topic} for 30 days. Here's what happened:`,
    `Stop doing ${opts.topic} the hard way.`,
    `The #1 ${opts.topic} mistake killing your growth:`,
    `${opts.topic} changed everything for me. Here's how:`,
    `Unpopular opinion: ${opts.topic} is overrated. Here's what works:`,
    `3 ${opts.topic} tips that actually move the needle:`,
    `I spent 100 hours on ${opts.topic}. Here's the shortcut:`,
    `Most people get ${opts.topic} wrong. Here's why:`,
    `The ${opts.topic} framework that 10x'd my results:`,
  ];

  for (let i = 0; i < opts.count; i++) {
    const platform = opts.platforms[i % opts.platforms.length];
    const hook = hooks[i % hooks.length];

    posts.push({
      title: hook,
      content: `${hook}\n\nHere's what I've learned about ${opts.topic} after months of experimentation...\n\nThe key insight is that most people overcomplicate it. Keep it simple, stay consistent, and focus on what actually moves the needle.\n\nFollow for more ${opts.topic} insights.`,
      platform,
      contentType: platform === "twitter" ? (i % 3 === 0 ? "thread" : "text") : "text",
      hashtags: ["#growth", "#productivity", "#buildinpublic"],
      scheduledAt: new Date(now.getTime() + i * 3600000).toISOString(),
    });
  }

  return posts;
}

function getFallbackScript(niche: string): string {
  const scripts = [
    `Did you know that ${niche} is one of the fastest growing fields right now? Here are three things most people don't know. First, the market is expected to grow by 40 percent in the next two years. Second, top creators in this space are making six figures just from content. Third, the barrier to entry has never been lower. If you're not paying attention to ${niche}, you're leaving money on the table. Follow for more.`,
    `Everyone talks about ${niche} but nobody tells you this. The real secret isn't about working harder. It's about working smarter. Here's what the top 1 percent do differently. They focus on systems, not goals. They automate everything they can. And they never stop learning. If you apply these three principles to your ${niche} journey, you'll see results in 30 days. Save this for later.`,
    `Here's a ${niche} tip that changed everything for me. Stop trying to do everything at once. Pick one platform. Master it. Then expand. I went from posting randomly to having a system that generates content automatically. The result? 10x more engagement in just 60 days. Try this and let me know how it goes.`,
  ];
  return scripts[Math.floor(Math.random() * scripts.length)];
}
