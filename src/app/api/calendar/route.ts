import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getProfile } from "@/lib/auth-helpers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Rate limit: 5 calendar generations per hour per user
const CALENDAR_RATE_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

// POST /api/calendar — Generate a full 30-day content calendar
export async function POST(request: NextRequest) {
  const user = await requireAuth();

  // Rate limit: prevent API bill burn
  const { allowed, remaining, retryAfterSeconds } = checkRateLimit(
    `calendar:${user.id}`,
    CALENDAR_RATE_LIMIT.limit,
    CALENDAR_RATE_LIMIT.windowMs
  );

  if (!allowed) {
    return NextResponse.json(
      {
        error: `Rate limit reached. You can generate ${CALENDAR_RATE_LIMIT.limit} calendars per hour. Try again in ${retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(CALENDAR_RATE_LIMIT.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const supabase = await createSupabaseServerClient();

  const body = await request.json();
  const { month, year } = body;

  if (!month || !year) {
    return NextResponse.json({ error: "month and year required" }, { status: 400 });
  }

  // Get connected platforms
  const { data: platforms } = await supabase
    .from("connected_platforms")
    .select("platform")
    .eq("user_id", user.id)
    .eq("connected", true);

  const connectedPlatforms = platforms?.map((p) => p.platform) || [];

  if (connectedPlatforms.length === 0) {
    return NextResponse.json(
      { error: "Connect at least one platform first" },
      { status: 400 }
    );
  }

  // Get user profile for AI generation
  const profile = await getProfile(user.id);

  // Check if Claude API key is set
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "your-anthropic-api-key") {
    // Fallback: generate posts using the local algorithm
    const posts = generateLocalPosts(profile?.niche || "General", connectedPlatforms, month, year);

    // Create calendar
    const { data: calendar, error: calError } = await supabase
      .from("content_calendars")
      .upsert({
        user_id: user.id,
        month,
        year,
      })
      .select()
      .single();

    if (calError) {
      return NextResponse.json({ error: calError.message }, { status: 500 });
    }

    // Insert posts
    const postsToInsert = posts.map((p) => ({
      calendar_id: calendar.id,
      user_id: user.id,
      title: p.title,
      content: p.content,
      platform: p.platform,
      content_type: p.contentType,
      status: "draft",
      scheduled_at: p.scheduledAt || null,
      hashtags: p.hashtags,
      ai_generated: true,
    }));

    const { error: postsError } = await supabase.from("posts").insert(postsToInsert);

    if (postsError) {
      return NextResponse.json({ error: postsError.message }, { status: 500 });
    }

    // Fix: Don't leak config info
    return NextResponse.json({
      calendar,
      method: "local",
    });
  }

  // ── Claude API generation ──────────────────────────────────
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1).toLocaleString("en-US", { month: "long" });

    const prompt = `You are a content strategist for a creator in the "${profile?.niche || "General"}" niche.

Brand voice: ${profile?.brand_voice || "Professional, actionable, engaging."}
Target audience: ${profile?.target_audience || "Creators and entrepreneurs"}
Keywords: ${profile?.keywords?.join(", ") || "content, growth, productivity"}
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
        { error: "Failed to generate content. Please try again." },
        { status: 500 }
      );
    }

    // Create calendar
    const { data: calendar, error: calError } = await supabase
      .from("content_calendars")
      .upsert({
        user_id: user.id,
        month,
        year,
      })
      .select()
      .single();

    if (calError) {
      return NextResponse.json({ error: calError.message }, { status: 500 });
    }

    // Insert posts
    const postsToInsert = posts.map((p: Record<string, unknown>) => ({
      calendar_id: calendar.id,
      user_id: user.id,
      title: String(p.title || ""),
      content: String(p.content || ""),
      platform: String(p.platform || "twitter"),
      content_type: String(p.contentType || "text"),
      status: "draft",
      scheduled_at: p.scheduledAt ? new Date(String(p.scheduledAt)).toISOString() : null,
      hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
      ai_generated: true,
    }));

    const { error: postsError } = await supabase.from("posts").insert(postsToInsert);

    if (postsError) {
      return NextResponse.json({ error: postsError.message }, { status: 500 });
    }

    // Fix: Don't leak tokensUsed or API details
    return NextResponse.json({
      calendar,
      method: "claude",
    });
  } catch {
    // Fix: Don't log error object (may contain API key or sensitive details)
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}

// GET /api/calendar?month=9&year=2026
export async function GET(request: NextRequest) {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") || "0");
  const year = parseInt(searchParams.get("year") || "0");

  if (!month || !year) {
    const { data: calendars } = await supabase
      .from("content_calendars")
      .select("*, posts(*)")
      .eq("user_id", user.id)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    return NextResponse.json(calendars);
  }

  const { data: calendar } = await supabase
    .from("content_calendars")
    .select("*, posts(*)")
    .eq("user_id", user.id)
    .eq("month", month)
    .eq("year", year)
    .single();

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
