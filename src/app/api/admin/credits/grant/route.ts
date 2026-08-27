import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { apiValidationError } from "@/lib/errors";

export const POST = withAuth(
  async (request, { supabase }) => {
    const body = await request.json();
    const { user_id, amount, reason } = body;

    if (!user_id || typeof user_id !== "string") {
      return apiValidationError("user_id is required");
    }

    const creditAmount = parseInt(amount, 10);
    if (isNaN(creditAmount) || creditAmount <= 0 || creditAmount > 10000) {
      return apiValidationError("amount must be a positive integer (max 10,000)");
    }

    if (!reason || typeof reason !== "string" || reason.length > 500) {
      return apiValidationError("reason is required (max 500 characters)");
    }

    const admin = createSupabaseAdminClient();

    // Check user exists
    const { data: authUser, error: authError } =
      await admin.auth.admin.getUserById(user_id);

    if (authError || !authUser.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update credit balance
    const { data: existing } = await supabase
      .from("credit_balances")
      .select("balance")
      .eq("user_id", user_id)
      .single();

    const currentBalance = existing?.balance ?? 0;
    const newBalance = currentBalance + creditAmount;

    if (existing) {
      await supabase
        .from("credit_balances")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("user_id", user_id);
    } else {
      await supabase
        .from("credit_balances")
        .insert({ user_id, balance: newBalance });
    }

    // Log in credit_history
    await supabase.from("credit_history").insert({
      user_id,
      amount: creditAmount,
      type: "bonus",
      description: `[ADMIN] ${reason}`,
    });

    return NextResponse.json({
      success: true,
      user_id,
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
