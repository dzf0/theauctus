export type Platform = "twitter" | "instagram" | "linkedin" | "tiktok" | "youtube" | "threads" | "facebook" | "blog";

export type PostStatus = "draft" | "scheduled" | "publishing" | "published" | "failed";

export type PlanTier = "starter" | "growth" | "scale";

export interface CreatorProfile {
  id: string;
  name: string;
  email: string;
  niche: string;
  keywords: string[];
  platforms: ConnectedPlatform[];
  plan: PlanTier;
  onboarded: boolean;
  brandVoice: string;
  targetAudience: string;
  goals: string[];
}

export interface ConnectedPlatform {
  platform: Platform;
  connected: boolean;
  username?: string;
  followers?: number;
  lastSync?: string;
}

export interface ContentPost {
  id: string;
  title: string;
  content: string;
  platform: Platform;
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  mediaUrl?: string;
  hashtags: string[];
  engagement: EngagementMetrics;
  contentType: ContentType;
  aiGenerated: boolean;
}

export type ContentType = "text" | "image" | "video" | "carousel" | "story" | "reel" | "thread" | "blog-post";

export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  clicks: number;
}

export interface ContentCalendar {
  id: string;
  month: string;
  year: number;
  posts: ContentPost[];
  generatedAt: string;
  strategy: GrowthStrategy;
}

export interface GrowthStrategy {
  niche: string;
  pillars: ContentPillar[];
  postingFrequency: { platform: Platform; timesPerWeek: number }[];
  bestTimes: { platform: Platform; time: string; day: string }[];
  hashtags: HashtagGroup[];
  competitorInsights: string[];
  growthTactics: string[];
}

export interface ContentPillar {
  name: string;
  percentage: number;
  description: string;
  examples: string[];
}

export interface HashtagGroup {
  category: string;
  tags: string[];
}

export interface GrowthMetrics {
  totalFollowers: number;
  followersGrowth: number;
  totalEngagement: number;
  engagementRate: number;
  totalReach: number;
  postsPublished: number;
  topPerformingPost: ContentPost | null;
  platformBreakdown: { platform: Platform; followers: number; growth: number }[];
  weeklyData: { week: string; followers: number; engagement: number; reach: number }[];
  revenue: number;
  subscribers: number;
}

export interface ScheduledTask {
  id: string;
  postId: string;
  platform: Platform;
  executeAt: string;
  status: "pending" | "executing" | "completed" | "failed";
}

export interface ReferralProgram {
  code: string;
  referrals: number;
  credits: number;
  tier: "bronze" | "silver" | "gold";
}
