// ══════════════════════════════════════════════════════════════
// AI CONTENT GENERATION — Google Gemini + Search Grounding
// Used by: /api/posts (batch generation), /api/video/story
// Gemini searches the web for accurate, up-to-date content
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
  sources?: string[];  // URLs from web research
}

export interface GeneratePostsOptions {
  topic: string;
  platforms: string[];
  count: number;
  startDate?: string;       // YYYY-MM-DD
  frequency?: string;       // daily | 3x-week | 5x-week | weekly | auto
  niche?: string;
  brandVoice?: string;
  targetAudience?: string;
  tonePreferences?: string[];
}

/**
 * Generate social media posts using Gemini with Google Search grounding.
 * Gemini researches the web first, then creates accurate, data-backed posts.
 */
export async function generatePosts(opts: GeneratePostsOptions): Promise<GeneratedPost[]> {
  if (!GEMINI_API_KEY) {
    console.warn("No GEMINI_API_KEY — using fallback templates");
    return generateFallbackPosts(opts);
  }

  const postsPerPlatform = Math.ceil(opts.count / opts.platforms.length);

  const prompt = `You are an expert social media content strategist creating high-quality, in-depth, and FACTUALLY ACCURATE posts.

IMPORTANT: Before writing any content, RESEARCH the topic "${opts.topic}" using Google Search to find:
- Current trends, statistics, and recent developments
- Real case studies, examples, and success stories
- Up-to-date data points, percentages, and numbers
- Recent news or changes in this space
- Expert opinions and verified claims

Use the search results to make every claim accurate and every example real. Never fabricate statistics or make up examples — use what you find in the research.

TOPIC: "${opts.topic}"
NICHE: ${opts.niche || "General"}
BRAND VOICE: ${opts.brandVoice || "Professional, engaging, actionable"}
TARGET AUDIENCE: ${opts.targetAudience || "Creators and entrepreneurs"}
TONE: ${opts.tonePreferences?.join(", ") || "Friendly, informative"}

Generate exactly ${opts.count} social media posts across these platforms: ${opts.platforms.join(", ")}.
Each platform should get ~${postsPerPlatform} posts with content tailored to that platform's format and audience.

CRITICAL REQUIREMENTS:
- Every post MUST be SUBSTANTIAL — at least 150-300 words of content
- Every post MUST include at least 2-3 real data points, statistics, or verified facts from your research
- Reference real companies, tools, or examples found during research
- If you find a compelling recent study or statistic, build the post around it
- Twitter/X: Use threads (multiple tweets separated by \\n---\\n). Each thread should be 4-8 tweets with deep value
- Instagram: Long-form captions with storytelling, at least 200 words
- LinkedIn: Detailed professional posts, 200-400 words with data and personal stories
- TikTok: Script format, at least 100 words (30+ seconds of spoken content)
- YouTube: Detailed scripts, 200-400 words
- Facebook: Long-form community posts, 200-350 words
- Threads: Substantial conversational posts, 150-250 words
- Blog: Full articles, 300-500 words

Each post should include:
1. A compelling hook (first line that stops scrolling)
2. A detailed body with REAL data, actionable advice, examples, or storytelling
3. Key takeaways or bullet points
4. A strong call-to-action
5. 3-5 relevant hashtags

CONTENT MIX (spread across all posts):
- 30% Educational (tips, tutorials, how-tos with step-by-step detail)
- 25% Engagement (questions, polls, hot takes with reasoning)
- 25% Social proof (results, milestones, behind-the-scenes stories)
- 20% Promotional (CTAs, product mentions with value propositions)

RULES:
- Use REAL statistics and data from your web research — never make them up
- Reference real companies, tools, people, and events
- Tell stories backed by real examples
- Provide actionable steps — not vague advice
- Each post must feel like it alone provides real, verified value
- No filler, no generic statements, no fabricated claims

Return a JSON array. Each element:
{
  "title": "Short hook/headline (5-10 words)",
  "content": "Full post content — SUBSTANTIAL (150-400 words depending on platform). Use \\n for line breaks.",
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
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 16384,
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

    // Extract grounding sources from search results
    const sources: string[] = [];
    const steps = data?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    for (const chunk of steps) {
      if (chunk?.web?.uri) sources.push(chunk.web.uri);
    }

    // Parse JSON — handle markdown code fences if present
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    const posts = JSON.parse(jsonStr) as GeneratedPost[];

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error("Invalid response format from Gemini");
    }

    // Attach sources to each post
    if (sources.length > 0) {
      for (const post of posts) {
        post.sources = sources.slice(0, 5);
      }
    }

    console.log(`Gemini generated ${posts.length} posts with ${sources.length} web sources`);

    // Apply scheduling dates
    return applySchedule(posts, opts.startDate, opts.frequency);
  } catch (error) {
    console.error("Gemini generation failed:", error);
    // Fall back to template-based generation
    const fallback = generateFallbackPosts(opts);
    return applySchedule(fallback, opts.startDate, opts.frequency);
  }
}

/**
 * Generate a single video script using Gemini with Google Search grounding.
 * Minimum 30 seconds (~75 words), target matches duration param.
 */
export async function generateVideoScript(
  topic: string,
  niche: string,
  style: string,
  duration: number
): Promise<string> {
  // Enforce minimum 30 seconds
  const effectiveDuration = Math.max(duration, 30);
  const targetWords = Math.round(effectiveDuration * 2.5);

  if (!GEMINI_API_KEY) {
    return getFallbackScript(niche, targetWords);
  }

  const prompt = `Write a compelling short-form video script about "${topic}" in the ${niche} niche.

IMPORTANT: Before writing, RESEARCH this topic using Google Search to find:
- Current trends, statistics, and recent developments
- Real examples, case studies, or success stories
- Verified data points you can reference
- What's actually working right now in this space

Use real data from your research to make the script credible and accurate.

DURATION: ${effectiveDuration} seconds (at least ${targetWords} words)
STYLE: ${style || "educational"}

STRUCTURE:
1. HOOK (first 3-5 seconds): A bold claim, surprising fact, or provocative question backed by real data
2. PROBLEM (5-10 seconds): Identify the pain point or misconception your audience faces
3. SOLUTION (15-20 seconds): Deliver the core value — step-by-step advice, a framework, or a story with a clear lesson
4. PROOF (5-10 seconds): Back it up with a specific example, number, or case study from your research
5. CTA (3-5 seconds): Tell them exactly what to do next (follow, save, share, comment)

CRITICAL RULES:
- Write for SPOKEN WORD — conversational, natural rhythm, like talking to a friend
- Every sentence must earn its place — no filler, no generic statements
- Use REAL numbers, verified examples, and actionable steps from your research
- Keep sentences short and punchy for video pacing
- No hashtags, no emojis, no stage directions in brackets
- The script must be at least ${targetWords} words to fill ${effectiveDuration} seconds
- Think of this as a mini-lecture that delivers real, researched value

Return ONLY the script text. No title, no explanation, no quotes, no word count.`;

  try {
    const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    let script = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!script) {
      throw new Error("Empty response from Gemini");
    }

    console.log(`Gemini generated video script (${script.split(/\s+/).length} words)`);

    // Ensure minimum length — if too short, pad with a stronger ending
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

/**
 * Compute scheduled_at dates based on start date and frequency,
 * then distribute posts across days at optimal times per platform.
 */
function applySchedule(
  posts: GeneratedPost[],
  startDateStr?: string,
  frequency?: string
): GeneratedPost[] {
  if (!startDateStr && !frequency) return posts;

  const freq = frequency || "auto";
  const start = startDateStr ? new Date(startDateStr + "T12:00:00Z") : new Date();

  // Compute which days get posts
  const scheduleDays = computeScheduleDays(start, posts.length, freq);

  // Optimal posting hours per platform (UTC)
  const optimalHours: Record<string, number[]> = {
    twitter: [13, 17, 22],      // 8am, 12pm, 5pm ET
    instagram: [16, 24],         // 11am, 7pm ET
    linkedin: [12, 13],          // 7:30-8:30am ET
    tiktok: [15, 22],           // 10am, 5pm ET
    facebook: [13, 20],         // 8am, 3pm ET
    youtube: [18],              // 2pm ET
    threads: [14],              // 9am ET
    blog: [14],                 // 9am ET
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

/**
 * Generate array of Date objects for each post based on frequency.
 */
function computeScheduleDays(start: Date, count: number, freq: string): Date[] {
  const days: Date[] = [];
  const d = new Date(start);

  const weekdaysOnly = freq === "5x-week" || freq === "3x-week";
  const skip = freq === "5x-week"
    ? [0, 6] // skip Sat/Sun
    : freq === "3x-week"
    ? [0, 6] // skip weekends, place on M/W/F
    : [];

  const preferredDays = freq === "3x-week" ? [1, 3, 5] : []; // Mon, Wed, Fri

  while (days.length < count) {
    const dow = d.getDay();

    if (freq === "weekly") {
      // One post per week — always on the start day
      days.push(new Date(d));
      d.setDate(d.getDate() + 7);
    } else if (freq === "daily") {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    } else if (freq === "3x-week") {
      if (preferredDays.includes(dow)) {
        days.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    } else if (freq === "5x-week") {
      if (!skip.includes(dow)) {
        days.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    } else {
      // auto — every other day
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
      body: `Here's exactly what happened when I committed to ${opts.topic} for 30 days.\n\nDay 1-7: Nothing happened. Zero traction. I almost quit. But I remembered that every successful creator I admire went through this exact phase.\n\nDay 8-14: Small wins started appearing. A post got 3x my usual engagement. Someone DM'd me saying my content helped them. That kept me going.\n\nDay 15-21: The compound effect kicked in. My follower growth doubled. People started recognizing my name in comments. The algorithm began showing my content to non-followers.\n\nDay 22-30: Everything accelerated. I hit a milestone I'd been chasing for months. Brands started reaching out. Other creators asked to collaborate.\n\nHere are the 5 biggest lessons from this experiment:\n\nLesson 1: Consistency beats perfection. I posted every single day, even when the content wasn't my best work.\n\nLesson 2: The first 7 days are the hardest. Most people quit here. Push through.\n\nLesson 3: Engage more than you create. I spent 30 minutes daily engaging with my community.\n\nLesson 4: Track what works. I kept a spreadsheet of every post's performance. Patterns emerged by week 2.\n\nLesson 5: The results compound. Week 4 was 10x better than week 1, not because I got lucky, but because the foundation was built.\n\nWant the detailed breakdown of my strategy? Drop a "YES" in the comments and I'll share the exact calendar I followed.`,
    },
    {
      hook: `Stop doing ${opts.topic} the hard way`,
      body: `I wasted 6 months doing ${opts.topic} the wrong way before I discovered this approach.\n\nHere's what I was doing wrong:\n\nI was creating content from scratch every single day. Spending 4 hours on one post. Researching, writing, editing, designing — all for a single piece of content that might get 12 likes.\n\nSound familiar?\n\nHere's the shift that changed everything for me:\n\nI started using what I call the "Content Multiplication Method."\n\nStep 1: Create one pillar piece of content per week. This is your best, most detailed piece — a blog post, a long thread, or a video script.\n\nStep 2: Break it into 7-10 micro-content pieces. One thread becomes 5 tweets, 2 Instagram captions, a LinkedIn post, and a TikTok script.\n\nStep 3: Schedule everything across the week. You now have a full week of content from 2 hours of work.\n\nStep 4: Use AI tools to help with rephrasing and adapting for each platform's tone. Don't just copy-paste — adapt.\n\nStep 5: Batch engage. Instead of checking social media all day, dedicate two 20-minute blocks to meaningful engagement.\n\nThe result? I went from 3 posts per week to 15+ posts per week. My engagement tripled. And I actually have weekends off now.\n\nThe old way of doing ${opts.topic} is broken. Work smarter, not harder.\n\nFollow for more systems that actually work.`,
    },
    {
      hook: `The #1 ${opts.topic} mistake killing your growth`,
      body: `I've analyzed over 500 creators' accounts this year. Here's the single biggest mistake I see with ${opts.topic}:\n\nThey post and pray.\n\nThat's it. They create content, hit publish, and hope the algorithm does its thing. Then they wonder why nothing is growing.\n\nHere's what the top 1% do differently:\n\nThey treat every post like a product launch. That means:\n\nBefore posting: Research trending topics in your niche. Check what competitors are posting. Look at your own analytics to see what format performs best.\n\nDuring posting: Write a hook that creates curiosity or tension. Front-load value in the first 2 lines. Use formatting that makes the content scannable.\n\nAfter posting: Spend 30 minutes engaging with every comment. Reply to every DM. Share your post in relevant communities. Don't just post and disappear.\n\nThe data backs this up: Posts that get engagement in the first 30 minutes get 5x more reach than those that don't. That initial engagement window is everything.\n\nHere's my rule: Never post without a 30-minute engagement window blocked on my calendar right after. If I can't commit to that, I don't post.\n\n${opts.topic} isn't about creating more content. It's about making every piece of content work harder.\n\nSave this and actually implement it. Knowledge without action is just entertainment.`,
    },
    {
      hook: `${opts.topic} changed everything for me. Here's how`,
      body: `6 months ago, I was stuck at 200 followers posting random content about ${opts.topic} with zero strategy.\n\nToday, I've grown to 15,000+ followers, landed 3 brand deals, and built a community that actually engages.\n\nHere's the exact playbook I followed:\n\nWeek 1-2: Foundation\nI defined my niche clearly. Not just "${opts.niche || "content creation"}" — specifically "${opts.topic} for [specific audience]."\nI created a brand kit: consistent colors, fonts, and tone. Every post looks like it belongs to the same brand.\n\nWeek 3-4: Content System\nI picked 3 content pillars: Educational (40%), Behind-the-scenes (30%), Engagement (30%)\nI batch-create content every Sunday. 3 hours = 2 weeks of posts.\n\nMonth 2: Growth Tactics\nI started commenting on 20 accounts in my niche daily. Not generic comments — thoughtful, value-adding responses.\nI collaborated with 5 creators at my level. Cross-promotion is the fastest growth hack.\n\nMonth 3: Optimization\nI reviewed analytics weekly. Double-down on what works. Kill what doesn't.\nI started repurposing: One blog post = 10 social posts.\n\nMonth 4-6: Scaling\nHired a VA for scheduling and engagement.\nLaunched a free resource as a lead magnet.\nStarted a weekly series that builds anticipation.\n\nThe numbers don't lie. But the real win? I actually enjoy creating now because I have a system instead of a scramble.\n\nWant the detailed template? Comment SYSTEM and I'll DM it to you.`,
    },
  ];

  for (let i = 0; i < opts.count; i++) {
    const platform = opts.platforms[i % opts.platforms.length];
    const template = postTemplates[i % postTemplates.length];

    // Adapt content length based on platform
    let content = template.body;
    let contentType = "text";

    if (platform === "twitter") {
      // Convert to thread format
      const paragraphs = template.body.split("\n\n");
      content = paragraphs.join("\n\n---\n\n");
      contentType = "thread";
    } else if (platform === "instagram") {
      contentType = "carousel";
    } else if (platform === "linkedin") {
      contentType = "text";
    } else if (platform === "tiktok" || platform === "youtube") {
      // Convert to spoken script format
      content = template.body
        .replace(/\n\n/g, "\n\n")
        .replace(/\d+\.\s/g, "Number ");
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
      scheduledAt: new Date(now.getTime() + i * 86400000).toISOString(), // 1 day apart
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
    `Everyone talks about ${niche} but nobody tells you the real secret. And it's not what you think.\n\nThe real secret isn't about working harder. It's not about posting more. It's not about having the perfect aesthetic or the fanciest equipment.\n\nIt's about building systems.\n\nHere's what I mean. Most creators treat ${niche} like a daily task. They wake up, stare at a blank screen, and try to come up with something clever. That's exhausting, and it leads to inconsistent posting.\n\nThe creators who actually win — the ones with real, sustainable growth — they systematize everything.\n\nThey batch-create content one day per week. They schedule everything in advance using tools. They engage with their audience in focused 15-minute blocks instead of scrolling all day. And they review their analytics every single week to double down on what's working.\n\nHere's the three-step system I use personally. Step one: Every Sunday, I plan my content for the entire week. I look at what performed well last week and create similar content.\n\nStep two: I batch-create everything in one sitting. Three hours, five to seven pieces of content. Done.\n\nStep three: I schedule it all and then forget about it. My only daily task is 15 minutes of engagement — replying to comments, commenting on other creators' posts, and being part of the community.\n\nTry this system for 30 days. I promise you'll see a massive difference. Not just in your numbers, but in your sanity.\n\nSave this. Share it with a creator friend who needs to hear this. And follow for more ${niche} systems that actually work.`,
    `Here's a ${niche} strategy that completely changed my approach — and I wish someone had told me this when I was starting out.\n\nThe strategy is simple: Stop creating content for everyone. Start creating for someone specific.\n\nHere's what I mean. When I first started in ${niche}, I tried to appeal to everybody. My content was generic. My messaging was vague. And my growth was flat for months.\n\nThen I made one change. I picked a specific person — a specific audience member — and I wrote every single post as if I was talking directly to them.\n\nInstead of "tips for creators," I wrote "tips for solopreneurs who want to grow their brand on Instagram without paid ads." That specificity changed everything.\n\nMy engagement tripled. My follower growth went from 5 per day to 50 per day. And the best part? People started saying things like "It's like you're reading my mind" in the comments.\n\nHere's how to do it for yourself. Step one: Write down exactly who your ideal follower is. Age, interests, struggles, goals. Get specific.\n\nStep two: Write every post as if you're texting that one person. Use "you" language. Address their specific pain points.\n\nStep three: Review your analytics after two weeks. You'll see engagement skyrocket because people feel seen and understood.\n\nGeneric content gets generic results. Specific content gets specific fans — and fans are what build empires.\n\nFollow for more ${niche} strategies. And drop a comment telling me who YOUR ideal follower is — I'll give you feedback.`,
  ];
  return scripts[Math.floor(Math.random() * scripts.length)];
}
