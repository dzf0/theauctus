-- ══════════════════════════════════════════════════════════════
-- FIX: signup 500 — "relation profiles does not exist" (42P01)
-- Run this in Supabase SQL Editor. Safe to re-run.
--
-- Root cause (confirmed in Postgres logs): GoTrue (Supabase Auth)
-- executes trigger functions with a search_path that does NOT
-- include the public schema. Any unqualified table reference in an
-- auth.users trigger throws 42P01 and aborts signup with a 500.
-- Fix: fully qualify EVERY table reference (public.profiles) AND
-- pin search_path to empty per Supabase's security recommendation.
-- ══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- STEP 1: Delete orphaned profiles (auth user gone, profile left)
-- MUST run before Step 4 (FK add validates existing rows).
-- ──────────────────────────────────────────────
DELETE FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);

-- ──────────────────────────────────────────────
-- STEP 2: Harden the signup trigger
--  - Fully qualified public.profiles (fixes 42P01 under GoTrue)
--  - Never fails the signup: resolves username collisions by
--    appending _1, _2, ... instead of throwing
--  - Sanitizes usernames (alnum + underscore, max 20 chars)
--  - Falls back to email local-part for OAuth users with no
--    username metadata
--  - ON CONFLICT (id) makes re-signup idempotent
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  base_username TEXT;
  candidate TEXT;
  suffix INT := 0;
BEGIN
  base_username := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'username', ''),
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'user'
  );

  -- Sanitize: keep only alphanumerics and underscores
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g');
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'user';
  END IF;
  base_username := lower(left(base_username, 20));

  candidate := base_username;
  WHILE EXISTS (
    SELECT 1 FROM public.profiles WHERE username = candidate AND id <> NEW.id
  ) LOOP
    suffix := suffix + 1;
    candidate := left(base_username, 15) || '_' || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    candidate,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET username   = EXCLUDED.username,
        full_name  = EXCLUDED.full_name,
        updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Recreate the trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────
-- STEP 3: Unique index on username (case-insensitive)
-- Guarded: if duplicate usernames already exist among live users,
-- this step SKIPS (with a NOTICE) instead of aborting the whole
-- migration. Rename duplicates, then re-run this file.
-- ──────────────────────────────────────────────
DO $$
DECLARE
  dup_count INT;
BEGIN
  SELECT count(*) INTO dup_count FROM (
    SELECT lower(username) AS u
    FROM public.profiles
    WHERE username IS NOT NULL
    GROUP BY lower(username)
    HAVING count(*) > 1
  ) d;

  IF dup_count > 0 THEN
    RAISE NOTICE 'SKIPPED unique username index: % duplicate username(s) exist.', dup_count;
    RAISE NOTICE 'Find them with: SELECT lower(username), count(*) FROM public.profiles GROUP BY 1 HAVING count(*) > 1;';
    RAISE NOTICE 'Rename all but one, then re-run this migration.';
  ELSE
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (lower(username))';
    RAISE NOTICE 'Unique username index created.';
  END IF;
END $$;

-- ──────────────────────────────────────────────
-- STEP 4: Cascade profile deletion when auth user is deleted
-- Finds and drops ANY existing FK on profiles.id → auth.users(id)
-- (whatever its name), then adds the cascading one. Deleting a user
-- in the dashboard now always removes their profile too.
-- ──────────────────────────────────────────────
DO $$
DECLARE
  conname TEXT;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace tn ON tn.oid = t.relnamespace
  JOIN pg_class f ON f.oid = c.confrelid
  JOIN pg_namespace fn ON fn.oid = f.relnamespace
  WHERE tn.nspname = 'public'
    AND t.relname = 'profiles'
    AND fn.nspname = 'auth'
    AND f.relname = 'users'
    AND c.contype = 'f';

  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', conname);
    RAISE NOTICE 'Dropped existing FK constraint: %', conname;
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- ══════════════════════════════════════════════════════════════
-- DONE. Test: sign up at theauctus.in — signup should now succeed
-- instead of returning a 500.
-- ══════════════════════════════════════════════════════════════
