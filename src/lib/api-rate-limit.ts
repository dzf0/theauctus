// ══════════════════════════════════════════════════════════════
// API RATE LIMITING — Application-level wrapper
// Applies to all API endpoints via withRateLimit()
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// ══════════════════════════════════════════════════════════════
// RATE LIMIT CONFIGS PER ENDPOINT
// ══════════════════════════════════════════════════════════════

export const API_RATE_LIMITS = {
  // Auth endpoints
  "auth/signup": { limit: 3, windowMs: 10 * 60 * 1000 },
  "auth/signin": { limit: 10, windowMs: 5 * 60 * 1000 },
  "auth/verify-otp": { limit: 5, windowMs: 15 * 60 * 1000 },
  "auth/resend-otp": { limit: 3, windowMs: 5 * 60 * 1000 },
  "auth/check-username": { limit: 20, windowMs: 60 * 1000 },
  "auth/reset-password": { limit: 3, windowMs: 60 * 60 * 1000 },

  // Content endpoints
  "posts": { limit: 30, windowMs: 60 * 1000 },
  "posts/generate": { limit: 5, windowMs: 60 * 60 * 1000 },
  "calendar": { limit: 10, windowMs: 60 * 1000 },

  // Profile endpoints
  "profile": { limit: 30, windowMs: 60 * 1000 },
  "profile/complete-onboarding": { limit: 10, windowMs: 60 * 1000 },

  // User endpoints
  "user": { limit: 30, windowMs: 60 * 1000 },

  // Default
  default: { limit: 60, windowMs: 60 * 1000 },
} as const;

// ══════════════════════════════════════════════════════════════
// MAIN RATE LIMIT FUNCTION
// ══════════════════════════════════════════════════════════════

export async function rateLimitApi(
  request: Request,
  endpoint: string
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const ip = getClientIp(request);
  const config =
    API_RATE_LIMITS[endpoint as keyof typeof API_RATE_LIMITS] ||
    API_RATE_LIMITS.default;

  const key = `api:${endpoint}:${ip}`;
  const result = await checkRateLimit(key, config.limit, config.windowMs);

  if (!result.allowed) {
    const response = NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: result.retryAfterSeconds,
        message: `Rate limit exceeded. Try again in ${result.retryAfterSeconds} seconds.`,
      },
      { status: 429 }
    );

    response.headers.set("X-RateLimit-Limit", config.limit.toString());
    response.headers.set("X-RateLimit-Remaining", "0");
    response.headers.set("Retry-After", result.retryAfterSeconds.toString());

    return { allowed: false, response };
  }

  return { allowed: true };
}

// ══════════════════════════════════════════════════════════════
// MIDDLEWARE INTEGRATION
// ══════════════════════════════════════════════════════════════

export function withRateLimit(
  endpoint: string,
  handler: (request: Request) => Promise<NextResponse>
): (request: Request) => Promise<NextResponse> {
  return async (request: Request) => {
    const { allowed, response } = await rateLimitApi(request, endpoint);

    if (!allowed) {
      return response!;
    }

    return handler(request);
  };
}
