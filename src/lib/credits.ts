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
 * Bonus credits (trial) are spent FIRST, then purchased credits.
 * Uses SQL function deduct_credits_with_bonus() for atomic bonus-first deduction,
 * with a JS fallback for the legacy flow.
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

  // Step 1: Try the atomic SQL function (bonus-first deduction)
  const { data: newBalance, error: rpcError } = await admin.rpc(
    "deduct_credits_with_bonus",
    { p_user_id: user.id, p_amount: amount }
  );

  if (!rpcError && newBalance !== null) {
    // Success via SQL function
    await admin.from("credit_history").insert({
      user_id: user.id,
      amount: -amount,
      type: "usage",
      description,
      reference_id: referenceId || null,
    });

    return { success: true, balance: newBalance };
  }

  // Step 2: Fallback — manual bonus-first deduction (legacy DB without RPC)
  // Lazy-expire bonus credits first
  try { await admin.rpc("expire_bonus_credits", { p_user_id: user.id }); } catch { /* ok */ }

  const { data: row, error: fetchError } = await admin
    .from("credit_balances")
    .select("balance, bonus_credits, bonus_expires_at")
    .eq("user_id", user.id)
    .single();

  if (fetchError || !row) {
    return { success: false, error: "No credit balance found. Purchase credits first." };
  }

  const totalAvailable = (row.balance ?? 0) + (row.bonus_credits ?? 0);
  if (totalAvailable < amount) {
    return {
      success: false,
      error: `Insufficient credits. You need ${amount} but have ${totalAvailable}.`,
    };
  }

  let remaining = amount;
  let newBonus = row.bonus_credits ?? 0;
  let newRegBalance = row.balance ?? 0;

  // Spend bonus first (if not expired)
  const bonusActive =
    newBonus > 0 &&
    row.bonus_expires_at &&
    new Date(row.bonus_expires_at) > new Date();

  if (bonusActive) {
    const bonusUsed = Math.min(newBonus, remaining);
    newBonus -= bonusUsed;
    remaining -= bonusUsed;
  }

  // Spend remainder from regular balance
  newRegBalance -= remaining;

  // Atomic update with optimistic lock
  const { data: updated, error: updateError } = await admin
    .from("credit_balances")
    .update({
      balance: newRegBalance,
      bonus_credits: newBonus,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .gte("balance", remaining) // Guard against double-spend
    .select("balance")
    .single();

  if (updateError || !updated) {
    const { data: current } = await admin
      .from("credit_balances")
      .select("balance, bonus_credits")
      .eq("user_id", user.id)
      .single();
    const total = (current?.balance ?? 0) + (current?.bonus_credits ?? 0);
    return {
      success: false,
      error: `Insufficient credits. You need ${amount} but have ${total}.`,
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

  return { success: true, balance: (updated.balance ?? 0) + newBonus };
}

/**
 * Check if user has enough credits (or is admin). Does NOT deduct.
 * Includes bonus credits in the total.
 */
export async function checkCredits(
  user: User,
  amount: number
): Promise<{ hasEnough: boolean; balance?: number; bonusCredits?: number; bonusExpiresAt?: string | null }> {
  if (isAdminEmail(user.email)) {
    return { hasEnough: true };
  }

  const admin = createSupabaseAdminClient();

  // Lazy-expire bonus credits
  try { await admin.rpc("expire_bonus_credits", { p_user_id: user.id }); } catch { /* ok */ }

  const { data } = await admin
    .from("credit_balances")
    .select("balance, bonus_credits, bonus_expires_at")
    .eq("user_id", user.id)
    .single();

  const balance = data?.balance ?? 0;
  const bonusCredits = data?.bonus_credits ?? 0;
  const bonusExpiresAt = data?.bonus_expires_at ?? null;
  const totalBalance = balance + bonusCredits;

  return {
    hasEnough: totalBalance >= amount,
    balance: totalBalance,
    bonusCredits,
    bonusExpiresAt,
  };
}
