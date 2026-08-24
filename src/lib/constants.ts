import { Platform, PlanTier } from "./types";

// ══════════════════════════════════════════════════════════════
// APP CONFIGURATION
// ══════════════════════════════════════════════════════════════

export const APP_NAME = "TheAuctus";
export const APP_DESCRIPTION = "Automated Creator Growth Engine";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.theauctus.in";
export const APP_DOMAIN = "theauctus.in";

// ══════════════════════════════════════════════════════════════
// PRICING TIERS
// ══════════════════════════════════════════════════════════════

export interface PricingTier {
  id: PlanTier;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular: boolean;
  stripePriceId?: string; // Add Stripe price IDs when ready
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    description: "For creators ready to systematize their content",
    features: [
      "AI content calendar (30 posts/mo)",
      "3 connected platforms",
      "Basic analytics",
      "Content scheduling",
      "Email support",
    ],
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    description: "For serious creators scaling their audience",
    features: [
      "Unlimited AI generation",
      "All platforms connected",
      "Advanced analytics + revenue",
      "Content repurposing engine",
      "Growth tactics engine",
      "Priority support",
      "Referral program",
    ],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: 199,
    description: "For creators and teams building empires",
    features: [
      "Everything in Growth",
      "Team seats (up to 5)",
      "Custom AI training",
      "White-label reporting",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
    popular: false,
  },
];

// ══════════════════════════════════════════════════════════════
// PLATFORMS
// ══════════════════════════════════════════════════════════════

export interface PlatformConfig {
  id: Platform;
  name: string;
  icon: string;
  color: string;
  maxPostLength: number;
  supportsMedia: boolean;
  supportsHashtags: boolean;
}

export const PLATFORMS: PlatformConfig[] = [
  { id: "twitter", name: "Twitter/X", icon: "𝕏", color: "#1DA1F2", maxPostLength: 280, supportsMedia: true, supportsHashtags: true },
  { id: "linkedin", name: "LinkedIn", icon: "in", color: "#0A66C2", maxPostLength: 3000, supportsMedia: true, supportsHashtags: true },
  { id: "instagram", name: "Instagram", icon: "📷", color: "#E4405F", maxPostLength: 2200, supportsMedia: true, supportsHashtags: true },
  { id: "tiktok", name: "TikTok", icon: "♪", color: "#000000", maxPostLength: 2200, supportsMedia: true, supportsHashtags: true },
  { id: "youtube", name: "YouTube", icon: "▶", color: "#FF0000", maxPostLength: 5000, supportsMedia: true, supportsHashtags: true },
  { id: "threads", name: "Threads", icon: "@", color: "#000000", maxPostLength: 500, supportsMedia: true, supportsHashtags: true },
  { id: "facebook", name: "Facebook", icon: "f", color: "#1877F2", maxPostLength: 63206, supportsMedia: true, supportsHashtags: true },
  { id: "blog", name: "Blog", icon: "📝", color: "#FF6B6B", maxPostLength: 50000, supportsMedia: true, supportsHashtags: false },
];

// ══════════════════════════════════════════════════════════════
// NICHE OPTIONS
// ══════════════════════════════════════════════════════════════

export const NICHE_OPTIONS = [
  "Fashion & Beauty",
  "Food & Cooking",
  "Fitness & Health",
  "Travel & Adventure",
  "Technology & Gadgets",
  "Business & Entrepreneurship",
  "Education & Learning",
  "Entertainment & Comedy",
  "Art & Design",
  "Music & Audio",
  "Gaming",
  "Parenting & Family",
  "Pets & Animals",
  "Home & Garden",
  "Sports & Outdoors",
  "Finance & Investing",
  "Marketing & Social Media",
  "Health & Wellness",
  "Sustainability & Environment",
  "Other",
] as const;

// ══════════════════════════════════════════════════════════════
// BRAND VOICES
// ══════════════════════════════════════════════════════════════

export interface BrandVoiceOption {
  id: string;
  label: string;
  description: string;
}

export const BRAND_VOICE_OPTIONS: BrandVoiceOption[] = [
  { id: "professional", label: "Professional", description: "Authoritative and trustworthy" },
  { id: "casual", label: "Casual", description: "Friendly and approachable" },
  { id: "humorous", label: "Humorous", description: "Witty and entertaining" },
  { id: "inspirational", label: "Inspirational", description: "Motivating and uplifting" },
  { id: "educational", label: "Educational", description: "Informative and helpful" },
];

// ══════════════════════════════════════════════════════════════
// TONE OPTIONS
// ══════════════════════════════════════════════════════════════

export const TONE_OPTIONS = [
  "Formal",
  "Friendly",
  "Urgent",
  "Playful",
  "Authoritative",
  "Empathetic",
  "Bold",
  "Minimal",
] as const;

// ══════════════════════════════════════════════════════════════
// CONTENT GOALS
// ══════════════════════════════════════════════════════════════

export interface GoalOption {
  id: string;
  label: string;
  icon: string;
}

export const GOAL_OPTIONS: GoalOption[] = [
  { id: "engagement", label: "Increase Engagement", icon: "❤️" },
  { id: "sales", label: "Drive Sales", icon: "💰" },
  { id: "awareness", label: "Build Brand Awareness", icon: "📢" },
  { id: "education", label: "Educate Audience", icon: "📚" },
  { id: "entertainment", label: "Entertain Followers", icon: "🎭" },
  { id: "community", label: "Grow Community", icon: "👥" },
];

// ══════════════════════════════════════════════════════════════
// POSTING FREQUENCY
// ══════════════════════════════════════════════════════════════

export interface FrequencyOption {
  id: string;
  label: string;
  description: string;
}

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { id: "daily", label: "Daily", description: "7 posts per week" },
  { id: "3-5x-week", label: "3-5x per week", description: "Regular posting schedule" },
  { id: "1-2x-week", label: "1-2x per week", description: "Quality over quantity" },
  { id: "weekly", label: "Weekly", description: "One post per week" },
];

// ══════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ══════════════════════════════════════════════════════════════

export interface FeatureFlags {
  enableStripe: boolean;
  enableAnalytics: boolean;
  enableContentRepurposing: boolean;
  enableGrowthTactics: boolean;
  enableTeamSeats: boolean;
  enableAPIAccess: boolean;
  enableReferralProgram: boolean;
  enableWhiteLabel: boolean;
  enableCustomAITraining: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableStripe: false,
  enableAnalytics: true,
  enableContentRepurposing: false,
  enableGrowthTactics: false,
  enableTeamSeats: false,
  enableAPIAccess: false,
  enableReferralProgram: false,
  enableWhiteLabel: false,
  enableCustomAITraining: false,
};

// ══════════════════════════════════════════════════════════════
// AI CONFIGURATION
// ══════════════════════════════════════════════════════════════

export const AI_CONFIG = {
  maxTokensPerGeneration: 4000,
  defaultTemperature: 0.7,
  contentCalendarPosts: 30,
  rateLimitPerHour: 5,
  retryAttempts: 3,
  retryDelayMs: 1000,
};

// ══════════════════════════════════════════════════════════════
// RATE LIMITING
// ══════════════════════════════════════════════════════════════

export const RATE_LIMITS = {
  verifyOtp: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  resendOtp: { maxAttempts: 3, windowMs: 5 * 60 * 1000 }, // 3 requests per 5 min
  checkUsername: { maxAttempts: 20, windowMs: 60 * 1000 }, // 20 per minute
  calendarGeneration: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  signup: { maxAttempts: 3, windowMs: 10 * 60 * 1000 }, // 3 per 10 min
};

// ══════════════════════════════════════════════════════════════
// VALIDATION
// ══════════════════════════════════════════════════════════════

export const VALIDATION = {
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  },
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  targetAudience: {
    minLength: 10,
    maxLength: 200,
  },
};
