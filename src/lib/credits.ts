// ══════════════════════════════════════════════════════════════
// CREDIT HELPERS
// Deduct credits after AI generation. Admins are exempt.
// ══════════════════════════════════════════════════════════════

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdminEmail } from "@/lib/api-middleware";
import type { User } from "@supabase/supabase-js";

/**
 * Deduct credits for an AI action. Returns true if credits were deducted
 * or if the user is an admin (exempt). Returns false if insufficient credits.
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

  // Get current balance
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

  // Deduct
  const { error: updateError } = await admin
    .from("credit_balances")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (updateError) {
    return { success: false, error: "Failed to deduct credits" };
  }

  // Log in history
  await admin.from("credit_history").insert({
    user_id: user.id,
    amount: -amount,
    type: "usage",
    description,
    reference_id: referenceId || null,
  });

  return { success: true, balance: newBalance };
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
