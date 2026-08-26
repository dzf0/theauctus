import {
  CreatorProfile,
  ContentPost,
  ContentCalendar,
  GrowthMetrics,
  GrowthStrategy,
  Platform,
  ReferralProgram,
  ScheduledTask,
  PostStatus,
} from "./types";

// ── Simulated creator profile ──────────────────────────────────
export const creatorProfile: CreatorProfile = {
  id: "usr_001",
  name: "Alex Rivera",
  email: "alex@example.com",
  niche: "AI & Productivity",
  keywords: [
    "AI tools",
    "productivity hacks",
    "automation",
    "work smarter",
    "no-code",
    "creators",
    "solopreneur",
  ],
  platforms: [
    { platform: "twitter", connected: true, username: "@alexbuilds", followers: 12400, lastSync: "2026-08-22T10:00:00Z" },
    { platform: "linkedin", connected: true, username: "Alex Rivera", followers: 8900, lastSync: "2026-08-22T09:30:00Z" },
    { platform: "instagram", connected: true, username: "@alexbuilds", followers: 5600, lastSync: "2026-08-22T08:00:00Z" },
    { platform: "tiktok", connected: false },
    { platform: "youtube", connected: true, username: "Alex Rivera", followers: 3200, lastSync: "2026-08-21T22:00:00Z" },
    { platform: "threads", connected: false },
    { platform: "blog", connected: true, username: "blog.alexrivera.dev", followers: 0 },
  ],
  plan: "growth",
  onboarded: true,
  brandVoice:
    "Friendly, practical, no-BS. Uses short sentences. Drops occasional emojis. Focuses on actionable advice over theory.",
  targetAudience: "Solopreneurs and creators aged 25-45 who want to leverage AI to scale their output without hiring a team.",
  goals: ["Reach 50K followers across platforms in 90 days", "Launch a paid newsletter", "Generate $5K/mo in affiliate revenue"],
};

// ── Mock posts ─────────────────────────────────────────────────
const basePost: Omit<ContentPost, "id" | "title" | "content" | "platform" | "status" | "scheduledAt" | "publishedAt" | "contentType"> = {
  hashtags: ["#AItools", "#productivity", "#solopreneur"],
  engagement: { likes: 0, comments: 0, shares: 0, saves: 0, reach: 0, impressions: 0, clicks: 0 },
  aiGenerated: true,
};

function makePost(
  id: string,
  title: string,
  content: string,
  platform: Platform,
  status: PostStatus,
  contentType: ContentPost["contentType"],
  scheduledAt?: string,
  publishedAt?: string,
  engagement?: Partial<ContentPost["engagement"]>
): ContentPost {
  return {
    ...basePost,
    id,
    title,
    content,
    platform,
    status,
    contentType,
    scheduledAt,
    publishedAt,
    engagement: { ...basePost.engagement, ...engagement },
  };
}

export const mockPosts: ContentPost[] = [
  makePost(
    "post_001",
    "I replaced my entire content team with one AI workflow",
    "Here's the exact system I built in 2 hours that now creates 30 days of content across 4 platforms.\n\nNoVA, no content calendar spreadsheets, no hiring.\n\nThread:",
    "twitter",
    "published",
    "thread",
    undefined,
    "2026-08-20T14:00:00Z",
    { likes: 847, comments: 123, shares: 234, saves: 89, reach: 23400, impressions: 45200, clicks: 567 }
  ),
  makePost(
    "post_002",
    "The 3-step AI content system nobody talks about",
    "Step 1: Feed AI your brand voice + top 10 performing posts\nStep 2: Generate a month of content pillars\nStep 3: Auto-schedule across platforms with optimal timing\n\nI went from 2hrs/day to 15min/week on content.",
    "linkedin",
    "published",
    "text",
    undefined,
    "2026-08-21T08:00:00Z",
    { likes: 432, comments: 67, shares: 156, saves: 201, reach: 18700, impressions: 34100, clicks: 312 }
  ),
  makePost(
    "post_003",
    "Stop creating content. Start engineering it.",
    "Most creators spend 80% of their time creating and 20% distributing.\n\nFlip that ratio.\n\nUse AI to create in 20% and spend 80% on distribution strategy.\n\nHere's how →",
    "instagram",
    "scheduled",
    "carousel",
    "2026-08-23T10:00:00Z",
    undefined
  ),
  makePost(
    "post_004",
    "I built a $50K/mo content machine with 0 employees",
    "The creator economy is shifting. The winners won't be the ones who create the most — they'll be the ones who systemize the best.\n\nHere's my exact playbook.",
    "twitter",
    "scheduled",
    "text",
    "2026-08-23T14:00:00Z"
  ),
  makePost(
    "post_005",
    "Your content strategy is a spreadsheet problem, not a creativity problem",
    "Most creators don't have a content problem.\n\nThey have a systems problem.\n\nHere are 5 systems that took my content from random to revenue-generating:",
    "linkedin",
    "scheduled",
    "text",
    "2026-08-24T08:00:00Z"
  ),
  makePost(
    "post_006",
    "POV: You wake up and 30 days of content is already scheduled",
    "This is what happens when you build a content engine instead of a content workflow.\n\n3 platforms. 30 days. 2 hours of setup.\n\nNoVA.",
    "tiktok",
    "draft",
    "video"
  ),
  makePost(
    "post_007",
    "The AI content stack I use every single day",
    "Planning: ChatGPT for strategy\nWriting: Claude for drafts\nDesign: Canva AI for visuals\nScheduling: Auto-publisher\nAnalytics: Growth dashboard\n\nTotal time: 15 min/day",
    "twitter",
    "scheduled",
    "carousel",
    "2026-08-25T12:00:00Z"
  ),
  makePost(
    "post_008",
    "How I grew from 0 to 30K followers in 60 days using AI",
    "The secret isn't creating more content.\n\nIt's creating the RIGHT content, at the RIGHT time, on the RIGHT platform.\n\nHere's the framework:",
    "youtube",
    "draft",
    "video"
  ),
  makePost(
    "post_009",
    "3 AI prompts that write better than 90% of content creators",
    "Prompt 1: \"Write a [platform] post about [topic] in the style of [voice reference] with a hook that stops the scroll\"\n\nPrompt 2: \"Turn this long-form content into 5 platform-specific micro-content pieces\"\n\nPrompt 3: \"Analyze my top 10 posts and create a content formula I can repeat\"",
    "threads",
    "scheduled",
    "text",
    "2026-08-26T09:00:00Z"
  ),
  makePost(
    "post_010",
    "The creator who systems wins",
    "Here's the truth: talent doesn't scale.\n\nSystems scale.\n\nI replaced \"I need to post today\" with \"content is already scheduled for the next 30 days.\"\n\nThat shift changed everything.",
    "instagram",
    "scheduled",
    "text",
    "2026-08-27T11:00:00Z"
  ),
];

// ── Growth strategy ────────────────────────────────────────────
export const growthStrategy: GrowthStrategy = {
  niche: "AI & Productivity",
  pillars: [
    {
      name: "AI Tool Reviews",
      percentage: 30,
      description: "Honest reviews and tutorials of AI tools for creators",
      examples: ["I tested 10 AI writing tools. Only 2 are worth it.", "This free AI tool replaced my $500/mo software"],
    },
    {
      name: "Productivity Systems",
      percentage: 25,
      description: "Frameworks and workflows for working smarter",
      examples: ["My 15-min daily content system", "How I batch-create a month of content"],
    },
    {
      name: "Creator Business",
      percentage: 25,
      description: "Monetization, growth strategy, and business insights",
      examples: ["How I make $5K/mo from one newsletter", "The creator economy is broken. Here's why."],
    },
    {
      name: "Behind the Scenes",
      percentage: 20,
      description: "Transparent sharing of numbers, failures, and lessons",
      examples: ["I lost 2K followers. Here's what I learned.", "My actual revenue breakdown: Month 6"],
    },
  ],
  postingFrequency: [
    { platform: "twitter", timesPerWeek: 14 },
    { platform: "linkedin", timesPerWeek: 5 },
    { platform: "instagram", timesPerWeek: 5 },
    { platform: "youtube", timesPerWeek: 1 },
    { platform: "tiktok", timesPerWeek: 3 },
    { platform: "threads", timesPerWeek: 5 },
  ],
  bestTimes: [
    { platform: "twitter", time: "8:00 AM", day: "Mon-Fri" },
    { platform: "twitter", time: "12:00 PM", day: "Mon-Fri" },
    { platform: "twitter", time: "5:00 PM", day: "Mon-Fri" },
    { platform: "linkedin", time: "7:30 AM", day: "Tue-Thu" },
    { platform: "instagram", time: "11:00 AM", day: "Mon,Wed,Fri" },
    { platform: "instagram", time: "7:00 PM", day: "Tue,Thu" },
    { platform: "youtube", time: "2:00 PM", day: "Saturday" },
    { platform: "tiktok", time: "10:00 AM", day: "Tue,Thu,Sat" },
  ],
  hashtags: [
    { category: "AI", tags: ["#AItools", "#artificialintelligence", "#ChatGPT", "#AItips", "#machinelearning"] },
    { category: "Productivity", tags: ["#productivity", "#productivityhacks", "#worksmarter", "#efficiency", "#timemanagement"] },
    { category: "Creator Economy", tags: ["#creatoreconomy", "#solopreneur", "#sidehustle", "#digitalcreator", "#buildinpublic"] },
    { category: "Business", tags: ["#entrepreneur", "#onlinebusiness", "#passiveincome", "#businessgrowth", "#marketing"] },
  ],
  competitorInsights: [
    "@daboross posts 3x daily threads with high engagement — thread format dominates",
    "Top creators in AI niche post between 7-9 AM EST",
    "Carousel posts get 2.3x more saves than text posts on Instagram",
    "LinkedIn articles with data get 4x more comments than opinion posts",
    "Video-first creators are growing 3x faster than text-only",
  ],
  growthTactics: [
    "Engage with 20 accounts in your niche daily before posting",
    "Reply to every comment within the first 30 minutes of posting",
    "Cross-promote threads across Twitter and LinkedIn with platform-native formatting",
    "Repurpose top-performing tweets into carousels, reels, and blog posts",
    "Build an email list from day 1 — social followers don't own the audience",
    "Create a signature framework that becomes your brand anchor",
    "Use the 80/20 rule: 80% value, 20% promotion",
    "Collaborate with creators at your level, not above you",
  ],
};

// ── Growth metrics ─────────────────────────────────────────────
export const growthMetrics: GrowthMetrics = {
  totalFollowers: 30100,
  followersGrowth: 2847,
  totalEngagement: 12400,
  engagementRate: 4.8,
  totalReach: 89300,
  postsPublished: 47,
  topPerformingPost: mockPosts[0],
  platformBreakdown: [
    { platform: "twitter", followers: 12400, growth: 1200 },
    { platform: "linkedin", followers: 8900, growth: 890 },
    { platform: "instagram", followers: 5600, growth: 560 },
    { platform: "youtube", followers: 3200, growth: 197 },
  ],
  weeklyData: [
    { week: "Jul 21", followers: 24200, engagement: 8900, reach: 54000 },
    { week: "Jul 28", followers: 25100, engagement: 9400, reach: 61000 },
    { week: "Aug 4", followers: 26300, engagement: 10200, reach: 68000 },
    { week: "Aug 11", followers: 27500, engagement: 11100, reach: 74000 },
    { week: "Aug 18", followers: 28800, engagement: 11800, reach: 82000 },
    { week: "Aug 22", followers: 30100, engagement: 12400, reach: 89300 },
  ],
  revenue: 4800,
  subscribers: 156,
};

// ── Scheduled tasks ────────────────────────────────────────────
export const scheduledTasks: ScheduledTask[] = [
  { id: "task_001", postId: "post_003", platform: "instagram", executeAt: "2026-08-23T10:00:00Z", status: "pending" },
  { id: "task_002", postId: "post_004", platform: "twitter", executeAt: "2026-08-23T14:00:00Z", status: "pending" },
  { id: "task_003", postId: "post_005", platform: "linkedin", executeAt: "2026-08-24T08:00:00Z", status: "pending" },
  { id: "task_004", postId: "post_007", platform: "twitter", executeAt: "2026-08-25T12:00:00Z", status: "pending" },
  { id: "task_005", postId: "post_009", platform: "threads", executeAt: "2026-08-26T09:00:00Z", status: "pending" },
  { id: "task_006", postId: "post_010", platform: "instagram", executeAt: "2026-08-27T11:00:00Z", status: "pending" },
];

// ── Referral program ───────────────────────────────────────────
export const referralProgram: ReferralProgram = {
  code: "ALEX20",
  referrals: 23,
  credits: 230,
  tier: "silver",
};

// ── Helper: get posts by status ────────────────────────────────
export function getPostsByStatus(status: PostStatus): ContentPost[] {
  return mockPosts.filter((p) => p.status === status);
}

// ── Helper: get posts for a date range ─────────────────────────
export function getPostsInRange(start: string, end: string): ContentPost[] {
  return mockPosts.filter((p) => {
    const d = p.scheduledAt || p.publishedAt;
    return d && d >= start && d <= end;
  });
}

// ── Helper: platform display info ──────────────────────────────
export const platformConfig: Record<Platform, { label: string; color: string; icon: string }> = {
  twitter: { label: "Twitter / X", color: "#1DA1F2", icon: "X" },
  instagram: { label: "Instagram", color: "#E4405F", icon: "IG" },
  linkedin: { label: "LinkedIn", color: "#0A66C2", icon: "in" },
  tiktok: { label: "TikTok", color: "#000000", icon: "TT" },
  youtube: { label: "YouTube", color: "#FF0000", icon: "YT" },
  threads: { label: "Threads", color: "#000000", icon: "@" },
  facebook: { label: "Facebook", color: "#1877F2", icon: "f" },
  blog: { label: "Blog", color: "#6366F1", icon: "//" },
};
