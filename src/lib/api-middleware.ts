// ══════════════════════════════════════════════════════════════
// API MIDDLEWARE
// Unified authentication, rate limiting, plan gating, audit
// logging, and CSRF protection for all API routes.
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { type PlanTier } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import crypto from "crypto";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface AuthContext {
  user: User;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  profile: Record<string, unknown> | null;
}

export interface MiddlewareOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requirePlan?: PlanTier;
  rateLimit?: { limit: number; windowMs: number };
  rateLimitKey?: string;
  auditAction?: string;
  csrfProtection?: boolean;
  requireCredits?: number;
}

// ══════════════════════════════════════════════════════════════
// PLAN HIERARCHY
// ══════════════════════════════════════════════════════════════

const PLAN_HIERARCHY: Record<PlanTier, number> = {
  starter: 1,
  growth: 2,
  scale: 3,
};

function meetsPlanRequirement(
  userPlan: string | null | undefined,
  required: PlanTier
): boolean {
  const userLevel = PLAN_HIERARCHY[(userPlan as PlanTier) ?? "starter"] ?? 1;
  const requiredLevel = PLAN_HIERARCHY[required];
  return userLevel >= requiredLevel;
}

// ══════════════════════════════════════════════════════════════
// AUDIT LOGGING
// ══════════════════════════════════════════════════════════════

export async function auditLog(params: {
  userId: string;
  action: string;
  tableName?: string;
  recordId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  request?: Request;
}): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();
    const ipAddress = params.request
      ? getClientIp(params.request)
      : undefined;
    const userAgent = params.request
      ? params.request.headers.get("user-agent")?.slice(0, 500)
      : undefined;

    await supabase.from("audit_log").insert({
      user_id: params.userId,
      action: params.action,
      table_name: params.tableName ?? null,
      record_id: params.recordId ?? null,
      old_data: params.oldData ?? null,
      new_data: params.newData ?? null,
      ip_address: ipAddress ?? null,
      user_agent: userAgent ?? null,
    });
  } catch {
    console.error("[AUDIT] Failed to log action:", params.action);
  }
}

// ══════════════════════════════════════════════════════════════
// CSRF PROTECTION
// ══════════════════════════════════════════════════════════════

const CSRF_SECRET = process.env.CSRF_SECRET;

if (!CSRF_SECRET && process.env.NODE_ENV === "production") {
  console.error(
    "[SECURITY] CSRF_SECRET is not set. CSRF protection is weakened."
  );
}

/** Generate a dev-only fallback secret (not used in production). */
function getCsrfSecret(): string {
  if (CSRF_SECRET) return CSRF_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("CSRF_SECRET must be set in production");
  }
  // Dev-only fallback: derived from Supabase URL so it's unique per project
  const devSeed = process.env.NEXT_PUBLIC_SUPABASE_URL || "dev-fallback";
  return crypto.createHash("sha256").update(devSeed).digest("hex").slice(0, 32);
}

/**
 * Generate a CSRF token tied to the user's session.
 * Token format: base64url(userId:timestamp:hmac_signature)
 */
export function generateCsrfToken(userId: string): string {
  const timestamp = Date.now();
  const payload = `${userId}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", getCsrfSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

/**
 * Verify a CSRF token. Returns true if valid and not expired (1 hour).
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyCsrfToken(token: string, userId: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;

    const [tokenUserId, timestampStr, providedSig] = parts;
    if (tokenUserId !== userId) return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Token expires after 1 hour
    if (Date.now() - timestamp > 60 * 60 * 1000) return false;

    const expectedPayload = `${tokenUserId}:${timestampStr}`;
    const expectedSig = crypto
      .createHmac("sha256", getCsrfSecret())
      .update(expectedPayload)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    if (expectedSig.length !== providedSig.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(expectedSig),
      Buffer.from(providedSig)
    );
  } catch {
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// ADMIN CHECK
// ══════════════════════════════════════════════════════════════

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

// ══════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ══════════════════════════════════════════════════════════════

function jsonError(
  message: string,
  status: number,
  code?: string
): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: code || "ERROR", message } },
    { status }
  );
}

// ══════════════════════════════════════════════════════════════
// withAuth — THE MAIN WRAPPER
// ══════════════════════════════════════════════════════════════

export type AuthenticatedHandler = (
  request: Request,
  ctx: AuthContext
) => Promise<NextResponse>;

/**
 * Higher-order function that wraps an API route handler with:
 * - Authentication (verifies Supabase session)
 * - Rate limiting (Upstash Redis or in-memory fallback)
 * - Plan-based feature gating (starter < growth < scale)
 * - CSRF protection (HMAC-signed tokens, 1hr expiry)
 * - Credit balance enforcement
 * - Audit logging (writes to audit_log table)
 * - Error handling (catches all errors, returns JSON)
 */
export function withAuth(
  handler: AuthenticatedHandler,
  options: MiddlewareOptions = {}
) {
  const {
    requireAuth = true,
    requireAdmin = false,
    requirePlan = null,
    rateLimit = null,
    rateLimitKey,
    auditAction,
    csrfProtection,
    requireCredits,
  } = options;

  return async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      const method = request.method.toUpperCase();
      const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
      // CSRF: only check when explicitly opted-in via csrfProtection: true.
      // The old default (auto-check all state-changing) broke all browser requests
      // because no client-side code was sending x-csrf-token.
      const shouldCheckCsrf = csrfProtection === true;

      if (requireAuth || shouldCheckCsrf) {
        const supabase = await createSupabaseServerClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return jsonError("Authentication required", 401, "AUTHENTICATION_ERROR");
        }

        // ── Admin check ──────────────────────────────────────
        if (requireAdmin && !isAdminEmail(user.email)) {
          return jsonError("Admin access required", 403, "ADMIN_REQUIRED");
        }

        // ── Rate limiting ────────────────────────────────────
        if (rateLimit) {
          const ip = getClientIp(request);
          const key = `api:${rateLimitKey || "default"}:${ip}`;
          const { allowed, retryAfterSeconds } = await checkRateLimit(
            key,
            rateLimit.limit,
            rateLimit.windowMs
          );

          if (!allowed) {
            const response = jsonError(
              `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`,
              429,
              "RATE_LIMIT"
            );
            response.headers.set("Retry-After", String(retryAfterSeconds));
            response.headers.set("X-RateLimit-Limit", String(rateLimit.limit));
            response.headers.set("X-RateLimit-Remaining", "0");
            return response;
          }
        }

        // ── CSRF verification ────────────────────────────────
        if (shouldCheckCsrf && isStateChanging) {
          const csrfToken =
            request.headers.get("x-csrf-token") ||
            (await (async () => {
              try {
                const cloned = request.clone();
                const body = await cloned.json().catch(() => null);
                return body?._csrf;
              } catch {
                return null;
              }
            })());

          if (!csrfToken || !verifyCsrfToken(csrfToken, user.id)) {
            return jsonError("Invalid CSRF token", 403, "CSRF_ERROR");
          }
        }

        // ── Plan-based gating ────────────────────────────────
        let profile: Record<string, unknown> | null = null;
        if (requirePlan || auditAction) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          profile = data;

          let plan: string | null = null;
          const subResult = await supabase
            .from("subscriptions")
            .select("plan")
            .eq("user_id", user.id)
            .single();

          plan = subResult.data?.plan ?? "starter";

          if (requirePlan && !meetsPlanRequirement(plan, requirePlan)) {
            return jsonError(
              `This feature requires the ${requirePlan} plan or higher.`,
              403,
              "PLAN_REQUIRED"
            );
          }
        }

        // ── Credit balance check (admins exempt) ─────────────
        if (requireCredits && requireCredits > 0 && !isAdminEmail(user.email)) {
          const { data: balance } = await supabase
            .from("credit_balances")
            .select("balance")
            .eq("user_id", user.id)
            .single();

          const currentBalance = balance?.balance ?? 0;
          if (currentBalance < requireCredits) {
            return jsonError(
              `Insufficient credits. You need ${requireCredits} credits but have ${currentBalance}.`,
              402,
              "INSUFFICIENT_CREDITS"
            );
          }
        }

        // ── Audit logging ────────────────────────────────────
        if (auditAction) {
          auditLog({ userId: user.id, action: auditAction, request }).catch(() => {});
        }

        // ── Call the handler ─────────────────────────────────
        const supabaseForHandler = await createSupabaseServerClient();
        return await handler(request, {
          user,
          supabase: supabaseForHandler,
          profile,
        });
      }

      // ── No auth required (public endpoint) ─────────────────
      const supabase = await createSupabaseServerClient();
      return await handler(request, {
        user: null as unknown as User,
        supabase,
        profile: null,
      });
    } catch (error) {
      console.error("[API Error]", error);

      if (error instanceof NextResponse) return error;

      // In production, never leak internal error details
      const message = process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : (error instanceof Error ? error.message : "An unexpected error occurred");

      return jsonError(message, 500, "INTERNAL_ERROR");
    }
  };
}
