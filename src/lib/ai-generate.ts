// ══════════════════════════════════════════════════════════════
// AI CONTENT GENERATION — Google Gemini 2.0 Flash
// Used by: /api/posts (batch generation), /api/video/story
// Free tier: https://ai.google.dev/gemini-api/docs/pricing
// ══════════════════════════════════════════════════════════════

const GEMINI_API_KEY = () => process.env.GEMINI_API_KEY;
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export interface GeneratedPost {
  title: string;
  content: string;
  platform: string;
  contentType: string;
  hashtags: string[];
  scheduledAt: string | null;
  sources?: string[];
}

export interface GeneratePostsOptions {
  topic: string;
  platforms: string[];
  count: number;
  startDate?: string;
  frequency?: string;
  niche?: string;
  brandVoice?: string;
  targetAudience?: string;
  tonePreferences?: string[];
}

async function callGemini(prompt: string, maxTokens: number = 8192): Promise<string> {
  const apiKey = GEMINI_API_KEY();
  if (!apiKey) throw new Error("No GEMINI_API_KEY set");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

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
          maxOutputTokens: maxTokens,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return text;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Generate social media posts using Gemini 2.0 Flash.
 */
export async function generatePosts(opts: GeneratePostsOptions): Promise<GeneratedPost[]> {
  const apiKey = GEMINI_API_KEY();
  console.log(`[ai-generate] GEMINI_API_KEY present: ${!!apiKey}, length: ${apiKey?.length || 0}`);
  if (!apiKey) {
    console.warn("[ai-generate] No GEMINI_API_KEY — using fallback templates");
    return generateFallbackPosts(opts);
  }

  const postsPerPlatform = Math.ceil(opts.count / opts.platforms.length);

  const prompt = `You are an elite social media content strategist. Your posts go viral because they are packed with specific, real, actionable value.

TOPIC: "${opts.topic}"
NICHE: ${opts.niche || "General"}
BRAND VOICE: ${opts.brandVoice || "Professional, engaging, actionable"}
TARGET AUDIENCE: ${opts.targetAudience || "Creators and entrepreneurs"}
TONE: ${opts.tonePreferences?.join(", ") || "Friendly, informative"}

Generate exactly ${opts.count} social media posts across: ${opts.platforms.join(", ")}.
Each platform gets ~${postsPerPlatform} posts tailored to that platform.

EVERY POST MUST:
- Be SUBSTANTIAL: 150-400 words of dense, valuable content
- Include 2-3 specific data points, numbers, or real examples
- Reference real tools, companies, people, or case studies
- Start with a hook that stops the scroll
- End with a clear CTA
- Include 3-5 relevant hashtags

PLATFORM FORMATS:
- Twitter/X: Thread format (4-8 tweets separated by \\n---\\n), each tweet adds value
- Instagram: Long caption with storytelling, minimum 200 words
- LinkedIn: Professional post with data + personal narrative, 200-400 words
- TikTok: Spoken script format, 100+ words
- YouTube: Detailed script, 200-400 words
- Facebook: Community-focused long post, 200-350 words
- Threads: Conversational thread, 150-250 words
- Blog: Full article with headers, 300-500 words

CONTENT MIX across all posts:
- 30% Educational (tactical tips with step-by-step detail)
- 25% Engagement (hot takes, contrarian opinions with reasoning)
- 25% Social proof (real results, specific milestones, case studies)
- 20% Promotional (CTAs with clear value propositions)

ABSOLUTE RULES:
- NEVER fabricate statistics — only use numbers you are confident about
- Reference real, verifiable companies, tools, and events
- Tell specific stories, not vague ones
- Every post must provide standalone value

Return ONLY a JSON array. Each element:
{
  "title": "Short hook/headline (5-10 words)",
  "content": "Full post content (150-400 words). Use \\n for line breaks.",
  "platform": "twitter|instagram|linkedin|tiktok|youtube|threads|facebook|blog",
  "contentType": "text|thread|carousel|video|reel|image|blog-post",
  "hashtags": ["tag1", "tag2", "tag3"]
}

Return ONLY the JSON array. No markdown fences, no explanation.`;

  try {
    const text = await callGemini(prompt, 8192);

    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    const posts = JSON.parse(jsonStr) as GeneratedPost[];

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error("Invalid response format from Gemini");
    }

    console.log(`Gemini generated ${posts.length} posts`);
    return applySchedule(posts, opts.startDate, opts.frequency);
  } catch (error) {
    console.error("Gemini generation failed:", error);
    const fallback = generateFallbackPosts(opts);
    return applySchedule(fallback, opts.startDate, opts.frequency);
  }
}

/**
 * Generate a single video script using Gemini 2.0 Flash.
 * Minimum 30 seconds (~75 words), target matches duration param.
 */
export async function generateVideoScript(
  topic: string,
  niche: string,
  style: string,
  duration: number
): Promise<string> {
  const effectiveDuration = Math.max(duration, 30);
  const targetWords = Math.round(effectiveDuration * 2.5);

  if (!GEMINI_API_KEY()) {
    console.warn("No GEMINI_API_KEY — using fallback script");
    return getFallbackScript(niche, targetWords);
  }

  const prompt = `Write a compelling ${effectiveDuration}-second short-form video script about "${topic}" in the ${niche} niche.

STYLE: ${style || "educational"}

STRUCTURE (follow this exactly):
1. HOOK (3-5 seconds): A bold claim, surprising fact, or provocative question that makes viewers stop scrolling
2. PROBLEM (5-10 seconds): Name the specific pain point your audience faces
3. SOLUTION (15-20 seconds): Deliver the core value with concrete steps, a framework, or a story with a clear lesson
4. PROOF (5-10 seconds): A specific number, real example, or case study
5. CTA (3-5 seconds): Exact next step — follow, save, share, comment

RULES:
- Write for SPOKEN WORD — conversational, like talking to a friend
- Every sentence must earn its place — zero filler
- Use specific numbers and real examples
- Short, punchy sentences for video pacing
- No hashtags, no emojis, no stage directions
- Minimum ${targetWords} words to fill ${effectiveDuration} seconds

Return ONLY the script text. No title, no explanation, no quotes around it.`;

  try {
    let script = await callGemini(prompt, 2048);

    if (!script) {
      throw new Error("Empty response from Gemini");
    }

    console.log(`Gemini generated video script (${script.split(/\s+/).length} words)`);

    const wordCount = script.split(/\s+/).filter(Boolean).length;
    if (wordCount < targetWords * 0.7) {
      script += `\n\nIf you found this valuable, save it for later and follow for more ${niche} tips that actually work. Drop a comment below with your biggest takeaway — I read every single one.`;
    }

    return script;
  } catch (error) {
    console.error("Gemini script generation failed:", error);
    return getFallbackScript(niche, targetWords);
  }
}

// ── Scheduling ───────────────────────────────────────────────

function applySchedule(
  posts: GeneratedPost[],
  startDateStr?: string,
  frequency?: string
): GeneratedPost[] {
  if (!startDateStr && !frequency) return posts;

  const freq = frequency || "auto";
  const start = startDateStr ? new Date(startDateStr + "T12:00:00Z") : new Date();
  const scheduleDays = computeScheduleDays(start, posts.length, freq);

  const optimalHours: Record<string, number[]> = {
    twitter: [13, 17, 22],
    instagram: [16, 24],
    linkedin: [12, 13],
    tiktok: [15, 22],
    facebook: [13, 20],
    youtube: [18],
    threads: [14],
    blog: [14],
  };

  return posts.map((post, i) => {
    const day = scheduleDays[i % scheduleDays.length];
    const hours = optimalHours[post.platform] || [14];
    const hour = hours[i % hours.length];
    const scheduled = new Date(day);
    scheduled.setUTCHours(hour, 0, 0, 0);
    return { ...post, scheduledAt: scheduled.toISOString() };
  });
}

function computeScheduleDays(start: Date, count: number, freq: string): Date[] {
  const days: Date[] = [];
  const d = new Date(start);

  const skip = freq === "5x-week" ? [0, 6] : freq === "3x-week" ? [0, 6] : [];
  const preferredDays = freq === "3x-week" ? [1, 3, 5] : [];

  while (days.length < count) {
    const dow = d.getDay();

    if (freq === "weekly") {
      days.push(new Date(d));
      d.setDate(d.getDate() + 7);
    } else if (freq === "daily") {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    } else if (freq === "3x-week") {
      if (preferredDays.includes(dow)) days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    } else if (freq === "5x-week") {
      if (!skip.includes(dow)) days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    } else {
      days.push(new Date(d));
      d.setDate(d.getDate() + 2);
    }
  }

  return days;
}

// ── Fallback generators (when no API key) ─────────────────────

function generateFallbackPosts(opts: GeneratePostsOptions): GeneratedPost[] {
  const posts: GeneratedPost[] = [];
  const now = new Date();

  const postTemplates = [
    {
      hook: `The ${opts.topic} strategy nobody talks about`,
      body: `Here's what most people get wrong about ${opts.topic}: they overcomplicate it.\n\nAfter working with dozens of creators in the ${opts.niche || "this space"}, I've noticed a pattern. The ones who succeed aren't doing more — they're doing the right things consistently.\n\nHere's the framework that actually works:\n\n1. Start with ONE platform. Master it completely before expanding. I see too many people spread themselves thin across 5 platforms and do none of them well.\n\n2. Create a content system, not random posts. Batch your content creation. Set aside 2-3 hours once a week. Write 5-7 posts at once. Schedule them. Then focus on engagement.\n\n3. Study your analytics religiously. Not vanity metrics — real engagement. Which posts got saves? Which got shares? Those are your signals.\n\n4. Engage before you create. Spend 15 minutes commenting on other creators' posts before you publish your own. The algorithm rewards accounts that give more than they take.\n\n5. Repurpose everything. One good idea becomes a tweet thread, an Instagram carousel, a LinkedIn post, and a TikTok script. Don't create from scratch every time.\n\nThe difference between creators who grow and those who don't isn't talent — it's system. Build the system first, and the growth follows.\n\nSave this. You'll want to reference it later.`,
    },
    {
      hook: `I tested ${opts.topic} for 30 days straight`,
      body: `Here's exactly what happened when I committed to ${opts.topic} for 30 days.\n\nDay 1-7: Nothing happened. Zero traction. I almost quit. But I remembered that every successful creator I admire went through this exact phase.\n\nDay 8-14: Small wins started appearing. A post got 3x my usual engagement. Someone DM'd me saying my content helped them. That kept me going.\n\nDay 15-21: The compound effect kicked in. My follower growth doubled. People started recognizing my name in comments. The algorithm began showing my content to non-followers.\n\nDay 22-30: Everything accelerated. I hit a milestone I'd been chasing for months. Brands started reaching out. Other creators asked to collaborate.\n\nHere are the 5 biggest lessons from this experiment:\n\nLesson 1: Consistency beats perfection.\nLesson 2: The first 7 days are the hardest. Push through.\nLesson 3: Engage more than you create.\nLesson 4: Track what works.\nLesson 5: The results compound.\n\nWant the detailed breakdown? Drop a "YES" in the comments.`,
    },
    {
      hook: `Stop doing ${opts.topic} the hard way`,
      body: `I wasted 6 months doing ${opts.topic} the wrong way before I discovered this approach.\n\nHere's what I was doing wrong: I was creating content from scratch every single day. Spending 4 hours on one post.\n\nSound familiar?\n\nHere's the shift that changed everything:\n\nStep 1: Create one pillar piece of content per week.\nStep 2: Break it into 7-10 micro-content pieces.\nStep 3: Schedule everything across the week.\nStep 4: Adapt for each platform's tone.\nStep 5: Batch engage in focused 20-minute blocks.\n\nThe result? I went from 3 posts per week to 15+. My engagement tripled.\n\nFollow for more systems that actually work.`,
    },
    {
      hook: `The #1 ${opts.topic} mistake killing your growth`,
      body: `I've analyzed over 500 creators' accounts this year. Here's the single biggest mistake I see:\n\nThey post and pray.\n\nThey create content, hit publish, and hope the algorithm does its thing.\n\nHere's what the top 1% do differently:\n\nBefore posting: Research trending topics. Check competitors. Review your analytics.\nDuring posting: Write a hook that creates curiosity. Front-load value.\nAfter posting: Spend 30 minutes engaging with every comment. Share in communities.\n\nPosts that get engagement in the first 30 minutes get 5x more reach.\n\nMy rule: Never post without a 30-minute engagement window right after.\n\nSave this and actually implement it.`,
    },
    {
      hook: `${opts.topic} changed everything for me. Here's how`,
      body: `6 months ago, I was stuck at 200 followers with zero strategy.\n\nToday: 15,000+ followers, 3 brand deals, and a community that engages.\n\nHere's the playbook:\n\nWeek 1-2: Defined my niche precisely. Created a consistent brand kit.\nWeek 3-4: Built a content system with 3 pillars: Educational, Behind-the-scenes, Engagement.\nMonth 2: Daily engagement on 20 niche accounts. Collaborated with 5 creators.\nMonth 3: Weekly analytics reviews. Repurposed everything.\nMonth 4-6: Hired a VA. Launched a lead magnet. Started a weekly series.\n\nThe real win? I enjoy creating now because I have a system instead of a scramble.\n\nComment SYSTEM and I'll DM you the template.`,
    },
  ];

  for (let i = 0; i < opts.count; i++) {
    const platform = opts.platforms[i % opts.platforms.length];
    const template = postTemplates[i % postTemplates.length];

    let content = template.body;
    let contentType = "text";

    if (platform === "twitter") {
      const paragraphs = template.body.split("\n\n");
      content = paragraphs.join("\n\n---\n\n");
      contentType = "thread";
    } else if (platform === "instagram") {
      contentType = "carousel";
    } else if (platform === "linkedin") {
      contentType = "text";
    } else if (platform === "tiktok" || platform === "youtube") {
      contentType = "video";
    } else if (platform === "blog") {
      content = `# ${template.hook}\n\n${template.body}\n\n---\n\n## Key Takeaways\n\n- System beats talent every time\n- Consistency compounds over time\n- Engage more than you create\n- Track your metrics weekly\n- Repurpose, don't recreate`;
      contentType = "blog-post";
    }

    posts.push({
      title: template.hook,
      content,
      platform,
      contentType,
      hashtags: generateHashtagsForPlatform(platform),
      scheduledAt: new Date(now.getTime() + i * 86400000).toISOString(),
    });
  }

  return posts;
}

function generateHashtagsForPlatform(platform: string): string[] {
  const common = ["#growth", "#productivity", "#buildinpublic", "#creatoreconomy"];
  const platformSpecific: Record<string, string[]> = {
    twitter: ["#TwitterGrowth", "#XMarketing", "#Thread"],
    instagram: ["#InstaTips", "#Reels", "#ContentCreator"],
    linkedin: ["#LinkedInTips", "#ProfessionalGrowth", "#CareerAdvice"],
    tiktok: ["#TikTokTips", "#Viral", "#FYP"],
    youtube: ["#YouTubeTips", "#ContentCreator", "#GrowYourChannel"],
    facebook: ["#FacebookMarketing", "#SocialMedia", "#CommunityBuilding"],
    threads: ["#ThreadsApp", "#CreatorLife", "#SocialMediaTips"],
    blog: ["#Blogging", "#ContentMarketing", "#SEO"],
  };
  const pool = [...common, ...(platformSpecific[platform] || [])];
  return pool.slice(0, 4);
}

function getFallbackScript(niche: string, targetWords: number = 100): string {
  const scripts = [
    `Did you know that ${niche} is one of the fastest growing industries right now? Here are three things most people completely miss.\n\nFirst, the market for ${niche} content is expected to grow by 40 percent in the next two years alone. That means there's more demand than ever for quality creators in this space.\n\nSecond, the top 1 percent of creators in ${niche} are making six figures — not from sponsorships, but from building their own products and communities. They figured out that audience ownership is everything.\n\nThird — and this is the one nobody talks about — the barrier to entry has never been lower. You don't need expensive equipment. You don't need a massive following. You need a clear niche, a consistent schedule, and the willingness to show up every single day.\n\nHere's my challenge to you: Pick one platform. Post every day for 30 days about ${niche}. Track your analytics. By day 30, you'll have more data than 90 percent of creators who've been at this for years.\n\nThe creators who win aren't the most talented. They're the most consistent. Start today, not tomorrow.\n\nFollow for more ${niche} strategies that actually work. And save this video — you'll want to come back to it when you're ready to take action.`,
    `Everyone talks about ${niche} but nobody tells you the real secret. And it's not what you think.\n\nThe real secret isn't about working harder. It's not about posting more. It's not about having the perfect aesthetic or the fanciest equipment.\n\nIt's about building systems.\n\nHere's what I mean. Most creators treat ${niche} like a daily task. They wake up, stare at a blank screen, and try to come up with something clever. That's exhausting, and it leads to inconsistent posting.\n\nThe creators who actually win — the ones with real, sustainable growth — they systematize everything.\n\nThey batch-create content one day per week. They schedule everything in advance using tools. They engage with their audience in focused 15-minute blocks instead of scrolling all day. And they review their analytics every single week to double down on what's working.\n\nTry this system for 30 days. I promise you'll see a massive difference. Not just in your numbers, but in your sanity.\n\nSave this. Share it with a creator friend who needs to hear this. And follow for more ${niche} systems that actually work.`,
    `Here's a ${niche} strategy that completely changed my approach — and I wish someone had told me this when I was starting out.\n\nThe strategy is simple: Stop creating content for everyone. Start creating for someone specific.\n\nWhen I first started in ${niche}, I tried to appeal to everybody. My content was generic. My messaging was vague. And my growth was flat for months.\n\nThen I picked a specific person — a specific audience member — and I wrote every single post as if I was talking directly to them.\n\nMy engagement tripled. My follower growth went from 5 per day to 50 per day.\n\nHere's how to do it: Write down exactly who your ideal follower is. Write every post as if you're texting that one person. Review your analytics after two weeks.\n\nGeneric content gets generic results. Specific content gets specific fans — and fans are what build empires.\n\nFollow for more ${niche} strategies.`,
  ];
  return scripts[Math.floor(Math.random() * scripts.length)];
}
