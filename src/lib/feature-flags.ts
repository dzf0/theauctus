// ══════════════════════════════════════════════════════════════
// FEATURE FLAGS
// Dynamic feature flag system for gradual rollouts
// ══════════════════════════════════════════════════════════════

import { DEFAULT_FEATURE_FLAGS, type FeatureFlags } from "./constants";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPercentage?: number; // 0-100
  allowedUserIds?: string[];
  allowedEmails?: string[];
  startDate?: Date;
  endDate?: Date;
}

export type FeatureFlagName = keyof FeatureFlags;

// ══════════════════════════════════════════════════════════════
// FEATURE FLAGS CLASS
// ══════════════════════════════════════════════════════════════

class FeatureFlagService {
  private flags: Map<string, FeatureFlagConfig> = new Map();
  private initialized = false;

  // Initialize with default flags
  init(): void {
    if (this.initialized) return;

    // Set default flags
    Object.entries(DEFAULT_FEATURE_FLAGS).forEach(([key, value]) => {
      this.flags.set(key, { enabled: value });
    });

    // Override with environment variables
    Object.keys(DEFAULT_FEATURE_FLAGS).forEach((key) => {
      const envKey = `FEATURE_${key.toUpperCase()}`;
      const envValue = process.env[envKey];
      if (envValue !== undefined) {
        this.flags.set(key, { enabled: envValue === "true" || envValue === "1" });
      }
    });

    this.initialized = true;
  }

  // Check if a feature is enabled
  isEnabled(flag: FeatureFlagName, userId?: string, email?: string): boolean {
    this.init();

    const config = this.flags.get(flag);
    if (!config) return false;

    // Basic enabled check
    if (!config.enabled) return false;

    // Check date range
    if (config.startDate && new Date() < config.startDate) return false;
    if (config.endDate && new Date() > config.endDate) return false;

    // Check user-specific flags
    if (userId && config.allowedUserIds) {
      return config.allowedUserIds.includes(userId);
    }

    // Check email-specific flags
    if (email && config.allowedEmails) {
      return config.allowedEmails.includes(email);
    }

    // Check rollout percentage
    if (config.rolloutPercentage !== undefined && userId) {
      const hash = this.hashString(userId + flag);
      return (hash % 100) < config.rolloutPercentage;
    }

    return true;
  }

  // Get all flags for a user
  getAllFlags(userId?: string, email?: string): Record<string, boolean> {
    this.init();

    const result: Record<string, boolean> = {};
    this.flags.forEach((_, key) => {
      result[key] = this.isEnabled(key as FeatureFlagName, userId, email);
    });
    return result;
  }

  // Update a flag (for admin use)
  setFlag(flag: string, config: Partial<FeatureFlagConfig>): void {
    this.init();
    const existing = this.flags.get(flag) || { enabled: false };
    this.flags.set(flag, { ...existing, ...config });
  }

  // Reset to defaults
  reset(): void {
    this.flags.clear();
    this.initialized = false;
    this.init();
  }

  // Simple hash function for rollout
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// ══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ══════════════════════════════════════════════════════════════

export const featureFlags = new FeatureFlagService();

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

// Server-side check
export function isFeatureEnabled(flag: FeatureFlagName, userId?: string, email?: string): boolean {
  return featureFlags.isEnabled(flag, userId, email);
}

// Client-side check (simplified - just checks if enabled)
export function useFeatureFlag(flag: FeatureFlagName): boolean {
  // In a real implementation, this would fetch from an API
  // For now, return the default value
  return DEFAULT_FEATURE_FLAGS[flag] ?? false;
}

// ══════════════════════════════════════════════════════════════
// FEATURE FLAG MIDDLEWARE
// ══════════════════════════════════════════════════════════════

export function withFeatureFlag(
  flag: FeatureFlagName,
  handler: () => Promise<Response>
): () => Promise<Response> {
  return async () => {
    if (!featureFlags.isEnabled(flag)) {
      return new Response(
        JSON.stringify({ error: "Feature not available" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    return handler();
  };
}
