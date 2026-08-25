/**
 * Upstash Redis-backed sliding window rate limiter.
 *
 * Distributed across all serverless instances — no cold-start resets.
 * Falls back to in-memory if UPSTASH_REDIS_REST_URL is not configured.
 *
 * Setup:
 *   1. Create an Upstash Redis instance at https://upstash.com
 *   2. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ══════════════════════════════════════════════════════════════
// REDIS CLIENT (shared across requests)
// ══════════════════════════════════════════════════════════════

let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // No Redis configured — fall back to in-memory (dev only)
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const r = getRedis();
  if (!r) return null;

  ratelimit = new Ratelimit({
    redis: r,
    // Sliding window: 10 requests per 10 seconds
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    // Prefix for all keys
    prefix: "growforge:ratelimit",
  });

  return ratelimit;
}

// ══════════════════════════════════════════════════════════════
// IN-MEMORY FALLBACK (dev only)
// ══════════════════════════════════════════════════════════════

interface RateLimitEntry {
  timestamps: number[];
}

const memStore = new Map<string, RateLimitEntry>();
const MAX_ENTRIES = 10_000;
let lastCleanup = Date.now();

function memCleanup() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  for (const [key, entry] of memStore) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 15 * 60 * 1000);
    if (entry.timestamps.length === 0) memStore.delete(key);
  }

  if (memStore.size > MAX_ENTRIES) {
    const entries = [...memStore.entries()]
      .sort((a, b) => {
        const aMin = Math.min(...a[1].timestamps);
        const bMin = Math.min(...b[1].timestamps);
        return aMin - bMin;
      })
      .slice(0, Math.floor(memStore.size / 2));
    for (const [key] of entries) memStore.delete(key);
  }
}

function memCheckRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  memCleanup();

  const now = Date.now();
  const entry = memStore.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    memStore.set(key, entry);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.timestamps.push(now);
  memStore.set(key, entry);
  return { allowed: true, remaining: limit - entry.timestamps.length, retryAfterSeconds: 0 };
}

// ══════════════════════════════════════════════════════════════
// TYPES & PUBLIC API
// ══════════════════════════════════════════════════════════════

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Check rate limit for a given key.
 * Uses Upstash Redis if configured, falls back to in-memory (dev only).
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const rl = getRatelimit();

  if (rl) {
    // Create a per-call Ratelimit instance to respect the caller's
    // limit and windowMs, instead of using the shared 10/10s config.
    const perCall = new Ratelimit({
      redis: getRedis()!,
      limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`),
      prefix: `growforge:${key}`,
    });

    const result = await perCall.limit(key);

    return {
      allowed: result.success,
      remaining: result.remaining,
      retryAfterSeconds: result.success
        ? 0
        : Math.max(0, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  }

  // Fallback: in-memory (dev only)
  return memCheckRateLimit(key, limit, windowMs);
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
    return ips[ips.length - 1];
  }

  return "unknown";
}

/** Rate limit configurations for each route */
export const RATE_LIMITS = {
  verifyOtp: { limit: 5, windowMs: 15 * 60 * 1000 },
  resendOtp: { limit: 3, windowMs: 5 * 60 * 1000 },
} as const;
