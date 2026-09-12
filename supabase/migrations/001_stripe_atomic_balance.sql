-- ══════════════════════════════════════════════════════════════
-- ATOMIC BALANCE INCREMENT
-- Used by Stripe webhook to safely add credits without
-- read-then-write race conditions.
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.increment_balance(p_user_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Upsert: create row if missing, then atomically increment
  INSERT INTO public.credit_balances (user_id, balance, updated_at)
  VALUES (p_user_id, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.credit_balances.balance + p_amount,
        updated_at = NOW();
END;
$$;
