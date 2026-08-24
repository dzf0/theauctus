// ══════════════════════════════════════════════════════════════
// API TYPES
// Request/Response types for all API endpoints
// ══════════════════════════════════════════════════════════════

import { Platform, PostStatus, ContentType, PlanTier } from "./types";

// ══════════════════════════════════════════════════════════════
// AUTH REQUESTS
// ══════════════════════════════════════════════════════════════

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  token: string;
  type: "signup" | "email" | "magiclink";
}

export interface ResendOtpRequest {
  email: string;
}

export interface CheckUsernameRequest {
  username: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  password: string;
}

// ══════════════════════════════════════════════════════════════
// AUTH RESPONSES
// ══════════════════════════════════════════════════════════════

export interface AuthResponse {
  userId: string;
  email: string;
}

export interface CheckUsernameResponse {
  available: boolean;
}

// ══════════════════════════════════════════════════════════════
// PROFILE REQUESTS
// ══════════════════════════════════════════════════════════════

export interface ProfileUpdateRequest {
  niche?: string;
  brandVoice?: string;
  tonePreferences?: string[];
  targetAudience?: string;
  contentGoals?: string[];
  postingFrequency?: string;
  onboarded?: boolean;
}

export interface ProfileGetResponse {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  niche: string | null;
  brand_voice: string | null;
  tone_preferences: string[];
  target_audience: string | null;
  content_goals: string[];
  posting_frequency: string | null;
  onboarded: boolean;
  plan: PlanTier;
  credits: number;
  created_at: string;
  updated_at: string;
}

// ══════════════════════════════════════════════════════════════
// CALENDAR REQUESTS
// ══════════════════════════════════════════════════════════════

export interface GenerateCalendarRequest {
  niche: string;
  keywords?: string[];
  brandVoice: string;
  tonePreferences: string[];
  targetAudience: string;
  postingFrequency: string;
}

export interface CalendarDay {
  date: string;
  posts: CalendarPost[];
}

export interface CalendarPost {
  id: string;
  platform: Platform;
  content: string;
  hashtags: string[];
  scheduledTime: string;
  contentType: ContentType;
  pillar: string;
  engagementPrediction: number;
}

export interface GenerateCalendarResponse {
  calendarId: string;
  month: string;
  year: number;
  posts: CalendarPost[];
  strategy: {
    pillars: string[];
    bestTimes: Record<string, string>;
    hashtagGroups: Record<string, string[]>;
  };
}

// ══════════════════════════════════════════════════════════════
// POST REQUESTS
// ══════════════════════════════════════════════════════════════

export interface CreatePostRequest {
  content: string;
  platform: Platform;
  scheduledAt?: string;
  mediaUrl?: string;
  hashtags?: string[];
  contentType?: ContentType;
}

export interface UpdatePostRequest {
  content?: string;
  scheduledAt?: string;
  status?: PostStatus;
  mediaUrl?: string;
  hashtags?: string[];
}

export interface PostResponse {
  id: string;
  content: string;
  platform: Platform;
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  mediaUrl: string | null;
  hashtags: string[];
  contentType: ContentType;
  aiGenerated: boolean;
  created_at: string;
}

// ══════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════

export interface AnalyticsRequest {
  startDate: string;
  endDate: string;
  platforms?: Platform[];
}

export interface AnalyticsResponse {
  totalFollowers: number;
  followersGrowth: number;
  totalEngagement: number;
  engagementRate: number;
  totalReach: number;
  postsPublished: number;
  platformBreakdown: {
    platform: Platform;
    followers: number;
    growth: number;
    engagement: number;
  }[];
  weeklyData: {
    week: string;
    followers: number;
    engagement: number;
    reach: number;
  }[];
}

// ══════════════════════════════════════════════════════════════
// BILLING
// ══════════════════════════════════════════════════════════════

export interface CreateCheckoutRequest {
  priceId: string;
  planId: PlanTier;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

export interface SubscriptionStatus {
  active: boolean;
  plan: PlanTier;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// ══════════════════════════════════════════════════════════════
// WEBHOOK EVENTS
// ══════════════════════════════════════════════════════════════

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export interface PlatformWebhookEvent {
  platform: Platform;
  type: "post.published" | "post.failed" | "metrics.updated";
  data: Record<string, unknown>;
}

// ══════════════════════════════════════════════════════════════
// PAGINATION
// ══════════════════════════════════════════════════════════════

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ══════════════════════════════════════════════════════════════
// PLATFORM CONNECTIONS
// ══════════════════════════════════════════════════════════════

export interface ConnectPlatformRequest {
  platform: Platform;
  code: string;
  redirectUri: string;
}

export interface PlatformConnectionResponse {
  platform: Platform;
  connected: boolean;
  username: string;
  expiresAt?: string;
}

export interface DisconnectPlatformRequest {
  platform: Platform;
}
