// ══════════════════════════════════════════════════════════════
// CACHING UTILITIES
// In-memory cache with TTL and stale-while-revalidate
// ══════════════════════════════════════════════════════════════

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize = 1000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number = 60000): void {
    if (this.store.size >= this.maxSize) {
      // Evict oldest entries
      const entries = [...this.store.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, Math.floor(this.maxSize / 2));
      
      for (const [key] of entries) {
        this.store.delete(key);
      }
    }

    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  // Get or set pattern
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = 60000): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const data = await fetcher();
    this.set(key, data, ttlMs);
    return data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now - entry.timestamp > entry.ttl) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Singleton instance
export const cache = new MemoryCache();

// ══════════════════════════════════════════════════════════════
// CACHE KEYS
// ══════════════════════════════════════════════════════════════

export const CacheKeys = {
  profile: (userId: string) => `profile:${userId}`,
  posts: (userId: string) => `posts:${userId}`,
  calendar: (userId: string) => `calendar:${userId}`,
  analytics: (userId: string) => `analytics:${userId}`,
  user: (userId: string) => `user:${userId}`,
  calendarGeneration: (userId: string) => `calendar-gen:${userId}`,
} as const;

// ══════════════════════════════════════════════════════════════
// CACHE DURATIONS
// ══════════════════════════════════════════════════════════════

export const CacheDuration = {
  SHORT: 30 * 1000,      // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000,  // 30 minutes
  HOUR: 60 * 60 * 1000,  // 1 hour
} as const;

// ══════════════════════════════════════════════════════════════
// HTTP CACHE HEADERS
// ══════════════════════════════════════════════════════════════

export function setCacheHeaders(
  response: Response,
  options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    private?: boolean;
    immutable?: boolean;
    noStore?: boolean;
  } = {}
): Response {
  const headers = new Headers(response.headers);

  if (options.noStore) {
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    headers.set("Pragma", "no-cache");
  } else {
    const directives: string[] = [];

    if (options.private) {
      directives.push("private");
    } else {
      directives.push("public");
    }

    if (options.maxAge !== undefined) {
      directives.push(`max-age=${options.maxAge}`);
    }

    if (options.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }

    if (options.immutable) {
      directives.push("immutable");
    }

    headers.set("Cache-Control", directives.join(", "));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ══════════════════════════════════════════════════════════════
// CACHE MIDDLEWARE
// ══════════════════════════════════════════════════════════════

export function withCaching<T>(
  key: string,
  ttlMs: number,
  handler: () => Promise<T>
): () => Promise<T> {
  return async () => {
    return cache.getOrSet(key, handler, ttlMs);
  };
}
