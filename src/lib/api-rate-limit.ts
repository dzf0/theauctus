// ══════════════════════════════════════════════════════════════
// API RATE LIMITING
// Applies to all API endpoints
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();
const MAX_ENTRIES = 10_000;

// Cleanup old entries every 5 minutes
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  const maxWindow = 15 * 60 * 1000;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < maxWindow);
    if (entry.timestamps.length === 0) store.delete(key);
  }

  if (store.size > MAX_ENTRIES) {
    const entries = [...store.entries()]
      .map(([key, entry]) => ({
        key,
        oldest: entry.timestamps.length > 0 ? Math.min(...entry.timestamps) : 0,
      }))
      .sort((a, b) => a.oldest - b.oldest);
    const toRemove = entries.slice(0, Math.floor(entries.length / 2));
    for (const { key } of toRemove) store.delete(key);
  }
}

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
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    return ips[ips.length - 1];
  }

  return "unknown";
}

function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfter: number } {
  cleanup();

  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    store.set(key, entry);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    retryAfter: 0,
  };
}

// ══════════════════════════════════════════════════════════════
// MAIN RATE LIMIT FUNCTION
// ══════════════════════════════════════════════════════════════

export function rateLimitApi(
  request: Request,
  endpoint: string
): { allowed: boolean; response?: NextResponse } {
  const ip = getClientIp(request);
  const config = API_RATE_LIMITS[endpoint as keyof typeof API_RATE_LIMITS] || API_RATE_LIMITS.default;

  const key = `api:${endpoint}:${ip}`;
  const result = checkRateLimit(key, config.limit, config.windowMs);

  if (!result.allowed) {
    const response = NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: result.retryAfter,
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      },
      { status: 429 }
    );

    response.headers.set("X-RateLimit-Limit", config.limit.toString());
    response.headers.set("X-RateLimit-Remaining", "0");
    response.headers.set("Retry-After", result.retryAfter.toString());

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
    const { allowed, response } = rateLimitApi(request, endpoint);

    if (!allowed) {
      return response!;
    }

    return handler(request);
  };
}
