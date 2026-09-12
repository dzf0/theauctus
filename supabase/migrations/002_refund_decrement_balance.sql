-- Migration: Add decrement_balance() for refund processing
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.decrement_balance(p_user_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.credit_balances
  SET balance = GREATEST(balance - p_amount, 0),
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;
