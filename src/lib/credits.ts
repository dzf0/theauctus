// ══════════════════════════════════════════════════════════════
// CREDIT HELPERS
// Deduct credits after AI generation. Admins are exempt.
// Uses optimistic locking (.gte guard) to prevent race conditions.
// ══════════════════════════════════════════════════════════════

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdminEmail } from "@/lib/api-middleware";
import type { User } from "@supabase/supabase-js";

/**
 * Deduct credits for an AI action. Returns true if credits were deducted
 * or if the user is an admin (exempt). Returns false if insufficient credits.
 *
 * Uses optimistic locking: reads balance, computes new value, then updates
 * with a `.gte("balance", amount)` guard so concurrent requests can't double-spend.
 */
export async function deductCredits(
  user: User,
  amount: number,
  description: string,
  referenceId?: string
): Promise<{ success: boolean; balance?: number; error?: string }> {
  // Admins never pay credits
  if (isAdminEmail(user.email)) {
    return { success: true };
  }

  const admin = createSupabaseAdminClient();

  // Step 1: Read current balance
  const { data: balance, error: fetchError } = await admin
    .from("credit_balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (fetchError || !balance) {
    return { success: false, error: "No credit balance found. Purchase credits first." };
  }

  if (balance.balance < amount) {
    return {
      success: false,
      error: `Insufficient credits. You need ${amount} but have ${balance.balance}.`,
    };
  }

  const newBalance = balance.balance - amount;

  // Step 2: Atomic update with optimistic lock — only update if balance hasn't changed
  // .gte("balance", amount) acts as WHERE balance >= amount in SQL
  const { data: updated, error: updateError } = await admin
    .from("credit_balances")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .gte("balance", amount) // Guard: prevents double-spend in race conditions
    .select("balance")
    .single();

  if (updateError || !updated) {
    // Either a race condition occurred (another request deducted first) or DB error
    const { data: currentBalance } = await admin
      .from("credit_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    return {
      success: false,
      error: `Insufficient credits. You need ${amount} but have ${currentBalance?.balance ?? 0}.`,
    };
  }

  // Step 3: Log in history
  await admin.from("credit_history").insert({
    user_id: user.id,
    amount: -amount,
    type: "usage",
    description,
    reference_id: referenceId || null,
  });

  return { success: true, balance: updated.balance };
}

/**
 * Check if user has enough credits (or is admin). Does NOT deduct.
 */
export async function checkCredits(
  user: User,
  amount: number
): Promise<{ hasEnough: boolean; balance?: number }> {
  if (isAdminEmail(user.email)) {
    return { hasEnough: true };
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("credit_balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const currentBalance = data?.balance ?? 0;
  return { hasEnough: currentBalance >= amount, balance: currentBalance };
}
