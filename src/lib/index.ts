// ══════════════════════════════════════════════════════════════
// BARREL EXPORTS
// Re-export everything for cleaner imports
// ══════════════════════════════════════════════════════════════

// Types
export * from "./types";
export * from "./api-types";

// Constants
export * from "./constants";

// Utilities
export { env, isProduction, isDevelopment } from "./env";
export * from "./errors";
export * from "./validate";

// Services
export { featureFlags, isFeatureEnabled, useFeatureFlag, withFeatureFlag } from "./feature-flags";
export * from "./webhooks";

// Supabase
export { createSupabaseClient } from "./supabase";
export { createSupabaseServerClient } from "./supabase-server";

// Rate limiting
export { checkRateLimit, getClientIp } from "./rate-limit";

// API middleware
export { withAuth, auditLog, generateCsrfToken, verifyCsrfToken } from "./api-middleware";
export type { AuthContext, MiddlewareOptions } from "./api-middleware";
