-- ══════════════════════════════════════════════════════════════
-- FIX: signup 500 — "column full_name of relation profiles does not exist" (42703)
-- Run this in Supabase SQL Editor. Safe to re-run.
--
-- Root cause: migrations 001 and 002 created a trigger that inserts
-- full_name into profiles, but the column was never ALTERed into
-- the table. The original schema only has 'name'.
-- ══════════════════════════════════════════════════════════════

-- STEP 1: Add full_name column (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE 'Added full_name column to profiles.';
  ELSE
    RAISE NOTICE 'full_name column already exists — skipping.';
  END IF;
END $$;

-- STEP 2: Back-fill full_name from name where it's missing
UPDATE public.profiles
SET full_name = name
WHERE full_name IS NULL AND name IS NOT NULL AND name != '';

-- STEP 3: Ensure username column exists (needed by the trigger in 001/002)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT;
    RAISE NOTICE 'Added username column to profiles.';
  ELSE
    RAISE NOTICE 'username column already exists — skipping.';
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- DONE. Test: sign up — the 500 should be resolved.
-- ══════════════════════════════════════════════════════════════
