-- Migration: Trial bonus credits system
-- Run this in Supabase SQL Editor

-- ══════════════════════════════════════════════════════════════
-- 1. Add bonus columns to credit_balances
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.credit_balances
  ADD COLUMN IF NOT EXISTS bonus_credits INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_expires_at TIMESTAMPTZ;

-- ══════════════════════════════════════════════════════════════
-- 2. expire_bonus_credits() — lazy expiry
-- Called before checking balance. Sets bonus to 0 if expired.
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.expire_bonus_credits(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  UPDATE public.credit_balances
  SET bonus_credits = 0,
      bonus_expires_at = NULL,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND bonus_credits > 0
    AND bonus_expires_at IS NOT NULL
    AND bonus_expires_at < NOW();
END;
$func$;

-- ══════════════════════════════════════════════════════════════
-- 3. deduct_credits_with_bonus() — deduct bonus first, then balance
-- Returns the remaining total balance (bonus + regular) after deduction.
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.deduct_credits_with_bonus(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_bonus INTEGER;
  v_bonus_expires TIMESTAMPTZ;
  v_balance INTEGER;
  v_remaining INTEGER;
BEGIN
  -- Lazy expiry first
  PERFORM public.expire_bonus_credits(p_user_id);

  -- Read current state
  SELECT bonus_credits, bonus_expires_at, balance
  INTO v_bonus, v_bonus_expires, v_balance
  FROM public.credit_balances
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No credit balance found for user %', p_user_id;
  END IF;

  v_remaining := p_amount;

  -- Deduct from bonus first (if not expired)
  IF v_bonus > 0 AND v_bonus_expires IS NOT NULL AND v_bonus_expires > NOW() THEN
    IF v_bonus >= v_remaining THEN
      v_bonus := v_bonus - v_remaining;
      v_remaining := 0;
    ELSE
      v_remaining := v_remaining - v_bonus;
      v_bonus := 0;
    END IF;
  END IF;

  -- Deduct remainder from regular balance
  IF v_remaining > 0 THEN
    IF v_balance < v_remaining THEN
      RAISE EXCEPTION 'Insufficient credits. Need %, have %', p_amount, (v_balance + v_bonus);
    END IF;
    v_balance := v_balance - v_remaining;
  END IF;

  -- Update
  UPDATE public.credit_balances
  SET bonus_credits = v_bonus,
      balance = v_balance,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN (v_balance + v_bonus);
END;
$func$;
