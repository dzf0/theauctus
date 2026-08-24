/**
 * In-memory sliding window rate limiter.
 *
 * Tracks request timestamps per key (typically IP + route).
 * Works per serverless instance — resets on cold start.
 * For production at scale, swap the store for Redis/Upstash.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

const MAX_ENTRIES = 10_000;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const maxWindow = 15 * 60 * 1000; // 15 min (largest window we use)
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < maxWindow);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }

  // Fix #13: Evict oldest entries if store is too large
  if (store.size > MAX_ENTRIES) {
    const entries = [...store.entries()]
      .map(([key, entry]) => ({
        key,
        oldest: entry.timestamps.length > 0 ? Math.min(...entry.timestamps) : 0,
      }))
      .sort((a, b) => a.oldest - b.oldest);

    const toRemove = entries.slice(0, Math.floor(entries.length / 2));
    for (const { key } of toRemove) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Check rate limit for a given key.
 *
 * @param key       Unique identifier (e.g. IP + route + email)
 * @param limit     Max requests allowed in the window
 * @param windowMs  Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldestTimestamp = entry.timestamps[0];
    const retryAfterSeconds = Math.ceil(
      (oldestTimestamp + windowMs - now) / 1000
    );

    store.set(key, entry);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Get client IP from request headers.
 * Handles Vercel, Cloudflare, and standard X-Forwarded-For.
 */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    // Use the last IP (added by the trusted proxy/Vercel edge)
    // The first IPs are client-controlled and can be spoofed
    return ips[ips.length - 1];
  }

  return "unknown";
}

/** Rate limit configurations for each route */
export const RATE_LIMITS = {
  /** OTP verification: 5 attempts per 15 minutes per IP+email */
  verifyOtp: {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  },
  /** Resend OTP: 3 requests per 5 minutes per IP+email */
  resendOtp: {
    limit: 3,
    windowMs: 5 * 60 * 1000,
  },
} as const;
