import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// POST /api/calendar — Generate a full 30-day content calendar
export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { month, year } = body;

  if (!month || !year) {
    return NextResponse.json({ error: "month and year required" }, { status: 400 });
  }

  const connectedPlatforms = user.platforms
    .filter((p) => p.connected)
    .map((p) => p.platform);

  if (connectedPlatforms.length === 0) {
    return NextResponse.json(
      { error: "Connect at least one platform first" },
      { status: 400 }
    );
  }

  // Check if Claude API key is set
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "your-anthropic-api-key") {
    // Fallback: generate posts using the local algorithm
    const posts = generateLocalPosts(user.niche || "General", connectedPlatforms, month, year);

    const calendar = await prisma.contentCalendar.create({
      data: {
        userId: user.id,
        month,
        year,
        posts: {
          create: posts.map((p) => ({
            userId: user.id,
            title: p.title,
            content: p.content,
            platform: p.platform,
            contentType: p.contentType,
            status: "draft",
            scheduledAt: p.scheduledAt ? new Date(p.scheduledAt) : null,
            hashtags: JSON.stringify(p.hashtags),
            aiGenerated: true,
          })),
        },
      },
      include: { posts: true },
    });

    return NextResponse.json({
      calendar,
      method: "local",
      note: "Add ANTHROPIC_API_KEY to .env for AI-generated content",
    });
  }

  // ── Claude API generation ──────────────────────────────────
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1).toLocaleString("en-US", { month: "long" });

    const prompt = `You are a content strategist for a creator in the "${user.niche || "General"}" niche.

Brand voice: ${user.brandVoice || "Professional, actionable, engaging."}
Target audience: ${user.targetAudience || "Creators and entrepreneurs"}
Keywords: ${user.keywords || "content, growth, productivity"}
Connected platforms: ${connectedPlatforms.join(", ")}

Generate a ${daysInMonth}-day content calendar for ${monthName} ${year}.

RULES:
- Create exactly ${Math.floor(daysInMonth * connectedPlatforms.length * 1.5)} posts total
- Each platform gets different content (not just reposted)
- Mix content types: text, threads, carousels, video ideas, images
- Each post must have a scroll-stopping hook in the first line
- Include 3-5 relevant hashtags per post
- Vary the topics across these pillars:
  1. Educational (tips, tutorials, how-tos) — 30%
  2. Engagement (questions, polls, hot takes) — 25%
  3. Social proof (results, milestones, behind-the-scenes) — 25%
  4. Promotional (CTAs, product mentions, newsletters) — 20%

Return a JSON array with this exact structure for each post:
{
  "title": "Short hook/headline",
  "content": "Full post content with line breaks",
  "platform": "twitter|linkedin|instagram|youtube|tiktok|threads",
  "contentType": "text|thread|carousel|video|reel|image",
  "scheduledAt": "YYYY-MM-DDTHH:MM:SSZ",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}

Schedule posts at optimal times:
- Twitter: 8AM, 12PM, 5PM weekdays
- LinkedIn: 7:30-8:30AM Tue-Thu
- Instagram: 11AM Mon/Wed/Fri, 7PM Tue/Thu
- YouTube: 2PM Saturday
- TikTok: 10AM Tue/Thu/Sat
- Threads: 9AM weekdays

Return ONLY the JSON array, no markdown, no explanation.`;

    const response = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    let posts;
    try {
      const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
      posts = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: text },
        { status: 500 }
      );
    }

    const calendar = await prisma.contentCalendar.create({
      data: {
        userId: user.id,
        month,
        year,
        posts: {
          create: posts.map((p: Record<string, unknown>) => ({
            userId: user.id,
            title: String(p.title || ""),
            content: String(p.content || ""),
            platform: String(p.platform || "twitter"),
            contentType: String(p.contentType || "text"),
            status: "draft",
            scheduledAt: p.scheduledAt ? new Date(String(p.scheduledAt)) : null,
            hashtags: JSON.stringify(p.hashtags || []),
            aiGenerated: true,
          })),
        },
      },
      include: { posts: true },
    });

    return NextResponse.json({
      calendar,
      method: "claude",
      tokensUsed: response.usage?.output_tokens || 0,
    });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}

// GET /api/calendar?month=9&year=2026
export async function GET(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") || "0");
  const year = parseInt(searchParams.get("year") || "0");

  if (!month || !year) {
    const calendars = await prisma.contentCalendar.findMany({
      where: { userId: user.id },
      include: { posts: { orderBy: { scheduledAt: "asc" } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return NextResponse.json(calendars);
  }

  const calendar = await prisma.contentCalendar.findUnique({
    where: { userId_month_year: { userId: user.id, month, year } },
    include: { posts: { orderBy: { scheduledAt: "asc" } } },
  });

  return NextResponse.json(calendar);
}

// ── Local fallback generator ──────────────────────────────────
function generateLocalPosts(
  niche: string,
  platforms: string[],
  month: number,
  year: number
) {
  const posts = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  const hooks = [
    `The ${niche} strategy nobody talks about:`,
    `I tested ${niche} for 30 days. Here's what happened:`,
    `Stop doing ${niche} the hard way.`,
    `The #1 ${niche} mistake killing your growth:`,
    `${niche} changed everything for me. Here's how:`,
    `Unpopular opinion: ${niche} is overrated. Here's what works:`,
    `3 ${niche} tips that actually move the needle:`,
    `I spent 100 hours on ${niche}. Here's the shortcut:`,
    `Most people get ${niche} wrong. Here's why:`,
    `The ${niche} framework that 10x'd my results:`,
  ];

  let idx = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    for (const platform of platforms) {
      if (Math.random() > 0.6) continue;

      const hook = hooks[idx % hooks.length];
      const date = new Date(year, month - 1, day, 9 + (idx % 10));

      posts.push({
        title: hook,
        content: `${hook}\n\nHere's what I've learned about ${niche} after months of experimentation...\n\nThe key insight is that most people overcomplicate it. Keep it simple, stay consistent, and focus on what actually moves the needle.\n\nFollow for more ${niche} insights.`,
        platform,
        contentType: platform === "twitter" ? (idx % 3 === 0 ? "thread" : "text") : "text",
        scheduledAt: date.toISOString(),
        hashtags: ["#growth", "#productivity", "#buildinpublic"],
      });
      idx++;
    }
  }
  return posts;
}
