import {
  ContentPost,
  ContentPillar,
  GrowthStrategy,
  Platform,
  ContentType,
} from "./types";

// ── Seed-based pseudo-random for deterministic "AI" output ─────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Content templates per platform ─────────────────────────────
const hooks = [
  "I made a huge mistake with {topic}. Here's what I learned.",
  "Nobody is talking about {topic} the right way.",
  "The {topic} strategy that 10x'd my growth:",
  "Stop doing {topic} the hard way.",
  "I tested {topic} for 30 days. The results shocked me.",
  "The #1 reason most creators fail at {topic}:",
  "{topic} changed everything for me. Here's how:",
  "I spent 100 hours on {topic}. Here's the shortcut:",
  "Unpopular opinion: {topic} is overrated. Here's what actually works:",
  "3 {topic} mistakes that are killing your growth:",
  "Here's the {topic} framework that took me from 0 to 30K:",
  "The truth about {topic} that gurus won't tell you:",
];

const ctaEndings = [
  "\n\nFollow @alexbuilds for more AI-powered growth strategies.",
  "\n\nSave this for later. You'll need it. 🔖",
  "\n\nWhat's your biggest {topic} challenge? Drop it below 👇",
  "\n\nRepost if this was helpful. I'll share the full breakdown.",
  "\n\nWant the template? Comment \"TEMPLATE\" and I'll DM it to you.",
  "\n\nThis is just the beginning. Part 2 drops tomorrow.",
  "\n\nShare this with a creator who needs to hear this.",
  "\n\nLike if you agree. The algorithm rewards early engagement.",
];

// ── Generate a single post ─────────────────────────────────────
export function generatePost(
  pillar: ContentPillar,
  platform: Platform,
  index: number,
  date: string
): ContentPost {
  const rand = seededRandom(dateToSeed(date) + index);
  const hook = hooks[Math.floor(rand() * hooks.length)].replace("{topic}", pillar.name.toLowerCase());
  const cta = ctaEndings[Math.floor(rand() * ctaEndings.length)].replace("{topic}", pillar.name.toLowerCase());

  const contentType = getContentType(platform, rand);
  const body = generateBody(pillar, platform, contentType, rand);

  return {
    id: `gen_${date.replace(/-/g, "")}_${index}`,
    title: hook,
    content: `${hook}\n\n${body}\n${cta}`,
    platform,
    status: "draft",
    scheduledAt: date,
    hashtags: generateHashtags(pillar, rand),
    engagement: { likes: 0, comments: 0, shares: 0, saves: 0, reach: 0, impressions: 0, clicks: 0 },
    contentType,
    aiGenerated: true,
  };
}

// ── Generate a full 30-day calendar ────────────────────────────
export function generateCalendar(
  strategy: GrowthStrategy,
  startMonth: string
): ContentPost[] {
  const posts: ContentPost[] = [];
  const year = parseInt(startMonth.split("-")[0]);
  const month = parseInt(startMonth.split("-")[1]);
  const daysInMonth = new Date(year, month, 0).getDate();

  const platforms: Platform[] = strategy.postingFrequency
    .sort((a, b) => b.timesPerWeek - a.timesPerWeek)
    .map((p) => p.platform);

  let postIndex = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${startMonth}-${String(day).padStart(2, "0")}`;
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    // Pick a pillar based on distribution
    const pillar = pickPillar(strategy.pillars, seededRandom(dateToSeed(dateStr)));

    // Assign platforms based on posting frequency
    const platformsForDay = platforms.filter((_, i) => {
      const freq = strategy.postingFrequency.find((p) => p.platform === platforms[i]);
      if (!freq) return false;
      const perDay = freq.timesPerWeek / 7;
      return seededRandom(dateToSeed(dateStr) + i)() < perDay;
    });

    // Ensure at least one post per day on weekdays
    if (platformsForDay.length === 0 && dayOfWeek > 0 && dayOfWeek < 6) {
      platformsForDay.push(platforms[0]);
    }

    for (const platform of platformsForDay) {
      posts.push(generatePost(pillar, platform, postIndex++, dateStr));
    }
  }

  return posts;
}

// ── Generate growth tactics based on metrics ───────────────────
export function generateGrowthTactics(
  niche: string,
  currentFollowers: number
): string[] {
  const tactics = [
    `Create a "${niche} Starter Pack" thread that becomes a resource people bookmark and share`,
    `Partner with 3 creators at your follower level for cross-promotion this month`,
    `Launch a weekly "${niche} tip" series that builds anticipation and habitual viewership`,
    `Repurpose your top 5 performing posts into 3 different formats (carousel, video, thread)`,
    `Build an email opt-in landing page — convert 2-5% of social followers to email subscribers`,
    `Create a signature hashtag for your community to use and track`,
    `Spend 30 min/day engaging in niche communities (Reddit, Discord, Twitter Spaces)`,
    `Run a "build in public" challenge for 30 days to create FOMO and community`,
    `Write 1 long-form piece and atomize it into 10+ micro-content pieces`,
    `Analyze your top 10 posts and create a repeatable content formula`,
  ];

  // Add tier-specific tactics
  if (currentFollowers < 5000) {
    tactics.push("Focus on Twitter threads — they have the highest organic reach for accounts under 5K");
    tactics.push("Reply to 50 accounts/day in your niche. Visibility > content quality at this stage.");
  } else if (currentFollowers < 20000) {
    tactics.push("Start a newsletter — you have enough audience to convert 3-5% to email");
    tactics.push("Create a free resource (template, checklist) as a lead magnet");
  } else {
    tactics.push("Launch a paid community or cohort — your audience size can support it");
    tactics.push("Negotiate brand partnerships — at your size, you can command $500-2K per sponsored post");
  }

  return tactics;
}

// ── Platform-aware content type selection ───────────────────────
function getContentType(
  platform: Platform,
  rand: () => number
): ContentType {
  const weights: Record<Platform, { type: ContentType; weight: number }[]> = {
    twitter: [
      { type: "text", weight: 0.4 },
      { type: "thread", weight: 0.3 },
      { type: "image", weight: 0.2 },
      { type: "carousel", weight: 0.1 },
    ],
    instagram: [
      { type: "carousel", weight: 0.35 },
      { type: "image", weight: 0.25 },
      { type: "reel", weight: 0.25 },
      { type: "story", weight: 0.15 },
    ],
    linkedin: [
      { type: "text", weight: 0.5 },
      { type: "carousel", weight: 0.3 },
      { type: "image", weight: 0.2 },
    ],
    tiktok: [{ type: "video", weight: 0.8 }, { type: "reel", weight: 0.2 }],
    youtube: [{ type: "video", weight: 1.0 }],
    threads: [{ type: "text", weight: 0.7 }, { type: "image", weight: 0.3 }],
    facebook: [
      { type: "text", weight: 0.3 },
      { type: "image", weight: 0.3 },
      { type: "video", weight: 0.4 },
    ],
    blog: [{ type: "blog-post", weight: 1.0 }],
  };

  const options = weights[platform] || [{ type: "text" as ContentType, weight: 1 }];
  const r = rand();
  let cumulative = 0;
  for (const opt of options) {
    cumulative += opt.weight;
    if (r <= cumulative) return opt.type;
  }
  return options[0].type;
}

// ── Generate body text per platform ────────────────────────────
function generateBody(
  pillar: ContentPillar,
  platform: Platform,
  contentType: ContentType,
  rand: () => number
): string {
  const examples = pillar.examples;
  const example = examples[Math.floor(rand() * examples.length)];

  const platformTone: Record<Platform, string> = {
    twitter: "Short, punchy, lots of line breaks. Easy to scan.",
    linkedin: "Professional but conversational. Data-backed claims.",
    instagram: "Visual-first thinking. Caption supports the visual.",
    tiktok: "Casual, trend-aware, hook in first 2 seconds.",
    youtube: "Detailed, educational, timestamps for chapters.",
    threads: "Conversational, personal, like texting a smart friend.",
    facebook: "Community-oriented, question-driven.",
    blog: "Long-form, SEO-optimized, thorough.",
  };

  return `${example}\n\n${platformTone[platform]}\n\nKey insight: The creators who win are the ones who systematize early. Don't wait until you're overwhelmed — build the engine now.`;
}

// ── Hashtag generation ─────────────────────────────────────────
function generateHashtags(
  pillar: ContentPillar,
  rand: () => number
): string[] {
  const pools = [
    ["#AItools", "#productivity", "#solopreneur", "#creatoreconomy", "#buildinpublic"],
    ["#growthhacking", "#contentmarketing", "#digitalmarketing", "#socialmediatips", "#marketing"],
    ["#automation", "#workflow", "#efficiency", "#worksmarter", "#nocode"],
    ["#sidehustle", "#passiveincome", "#onlinebusiness", "#entrepreneurship", "#moneymindset"],
  ];

  const pool = pools[Math.floor(rand() * pools.length)];
  return pool.slice(0, 3 + Math.floor(rand() * 2));
}

// ── Utility ────────────────────────────────────────────────────
function dateToSeed(dateStr: string): number {
  return dateStr.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function pickPillar(
  pillars: ContentPillar[],
  rand: () => number
): ContentPillar {
  const r = rand() * 100;
  let cumulative = 0;
  for (const pillar of pillars) {
    cumulative += pillar.percentage;
    if (r <= cumulative) return pillar;
  }
  return pillars[pillars.length - 1];
}
