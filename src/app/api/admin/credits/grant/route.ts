import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { apiValidationError } from "@/lib/errors";

// Simple in-memory idempotency cache (serverless-safe: per-instance, 30s window)
// Prevents double-grant from rapid duplicate clicks
const idempotencyCache = new Map<string, { granted: boolean; balance: number }>();

/**
 * Idempotency key = "grant:{adminUserId}:{targetUserId}:{amount}:{reasonHash}"
 * Hash the reason so identical requests with the same params are deduped.
 */
function makeIdempotencyKey(
  adminUserId: string,
  targetUserId: string,
  amount: number,
  reason: string
): string {
  const reasonHash = reason.slice(0, 32).normalize("NFKC").replace(/\s+/g, " ").trim();
  return `grant:${adminUserId}:${targetUserId}:${amount}:${reasonHash}`;
}

export const POST = withAuth(
  async (request, { user, supabase }) => {
    const body = await request.json();
    const { user_id: targetUserId, amount, reason } = body;

    // ── Validate inputs ─────────────────────────────────────────────
    if (!targetUserId || typeof targetUserId !== "string") {
      return apiValidationError("user_id is required");
    }

    const creditAmount = parseInt(amount, 10);
    if (isNaN(creditAmount) || creditAmount <= 0 || creditAmount > 10000) {
      return apiValidationError("amount must be a positive integer (max 10,000)");
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0 || reason.length > 500) {
      return apiValidationError("reason is required (1-500 characters)");
    }

    const admin = createSupabaseAdminClient();

    // ── Check caller is admin (defence in depth — withAuth already checks,
    //    but we also verify here in case middleware is bypassed) ───────
    const callerEmail = (user.email || "").toLowerCase();
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!adminEmails.includes(callerEmail)) {
      console.error("[ADMIN GRANT] Caller is not an admin:", callerEmail);
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // ── Check target user exists ─────────────────────────────────────
    const { data: authUser, error: authError } =
      await admin.auth.admin.getUserById(targetUserId);

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: `User not found: ${targetUserId.slice(0, 8)}...` },
        { status: 404 }
      );
    }

    // ── Idempotency guard ───────────────────────────────────────────
    const idemKey = makeIdempotencyKey(user.id, targetUserId, creditAmount, reason);
    const cached = idempotencyCache.get(idemKey);
    if (cached && cached.granted) {
      console.log(`[ADMIN GRANT] Idempotent duplicate ignored: ${idemKey}`);
      return NextResponse.json({
        success: true,
        user_id: targetUserId,
        amount: creditAmount,
        newBalance: cached.balance,
        note: "duplicate_request_ignored",
      });
    }

    // ── Atomic balance update via RPC (avoids race condition) ───────
    // Use increment_balance() which does an atomic UPSERT/ADD.
    // This is safe under concurrent requests — PostgreSQL handles the locking.
    //
    // If the RPC doesn't exist (e.g. migration not run), fall back to
    // a manual atomic UPDATE that does the same thing.
    let balanceUpdated = false;
    try {
      await admin.rpc("increment_balance", {
        p_user_id: targetUserId,
        p_amount: creditAmount,
      });
      balanceUpdated = true;
      console.log(`[ADMIN GRANT] increment_balance RPC succeeded for ${targetUserId.slice(0, 8)}...`);
    } catch (rpcError) {
      console.error("[ADMIN GRANT] increment_balance RPC failed, trying SQL fallback:", rpcError);

      // SQL fallback: atomic UPDATE that adds to existing balance,
      // or INSERT if no row exists (matches increment_balance behaviour)
      try {
        // Try UPDATE first (row exists)
        const { data: updated, error: updateError } = await admin
          .from("credit_balances")
          .update({
            balance: (b: { balance: number } & Record<string, unknown>) => ({ balance: b.balance + creditAmount }),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", targetUserId)
          .select("balance");

        if (!updateError && updated && updated.length > 0) {
          balanceUpdated = true;
          console.log(`[ADMIN GRANT] SQL UPDATE fallback succeeded for ${targetUserId.slice(0, 8)}...`);
        } else {
          // Row doesn't exist — INSERT new balance
          const { data: inserted, error: insertError } = await admin
            .from("credit_balances")
            .insert({ user_id: targetUserId, balance: creditAmount })
            .select("balance");

          if (!insertError && inserted && inserted.length > 0) {
            balanceUpdated = true;
            console.log(`[ADMIN GRANT] SQL INSERT fallback succeeded for ${targetUserId.slice(0, 8)}...`);
          } else {
            throw insertError || new Error("Both UPDATE and INSERT failed");
          }
        }
      } catch (fallbackError) {
        console.error("[ADMIN GRANT] SQL fallback also failed:", fallbackError);
        return NextResponse.json(
          { error: `Failed to update balance: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}` },
          { status: 500 }
        );
      }
    }

    // ── Read the new balance to return to caller ────────────────────
    // Re-read from DB to get the authoritative balance (handles both
    // RPC and SQL fallback paths)
    let newBalance = creditAmount;
    try {
      const { data: refreshed } = await admin
        .from("credit_balances")
        .select("balance")
        .eq("user_id", targetUserId)
        .single();
      newBalance = refreshed?.balance ?? creditAmount;
    } catch {
      // If we can't read back, trust the amount we added
      newBalance = creditAmount;
    }

    // ── Log in credit_history (type = admin_grant so it's distinguishable) ──
    try {
      await admin.from("credit_history").insert({
        user_id: targetUserId,
        amount: creditAmount,
        type: "admin_grant",
        description: `[ADMIN] ${reason}`,
      });
    } catch (err) {
      // History insert failure should NOT rollback the grant
      console.error("[ADMIN GRANT] Failed to log credit_history:", err);
    }

    // ── Store in idempotency cache (30s TTL) ────────────────────────
    idempotencyCache.set(idemKey, { granted: true, balance: newBalance });
    setTimeout(() => idempotencyCache.delete(idemKey), 30_000);

    // ── Audit log ──────────────────────────────────────────────────
    console.log(
      `[ADMIN GRANT] Admin ${user.email} granted ${creditAmount} credits to ${targetUserId.slice(0, 8)}... → new balance: ${newBalance}`
    );

    return NextResponse.json({
      success: true,
      user_id: targetUserId,
      amount: creditAmount,
      newBalance,
    });
  },
  {
    requireAdmin: true,
    rateLimit: { limit: 20, windowMs: 60_000 },
    rateLimitKey: "admin:credits:grant",
    auditAction: "admin_grant_credits",
  }
);
