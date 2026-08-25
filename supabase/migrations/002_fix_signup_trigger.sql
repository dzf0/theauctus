-- ══════════════════════════════════════════════════════════════
-- FIX: signup 500 caused by handle_new_user trigger collisions
-- Run this in Supabase SQL Editor. Safe to re-run.
--
-- Root cause: deleting an auth user (dashboard) left the profiles
-- row behind. The signup trigger then hit a username/id collision
-- and aborted the whole signup with a 500.
-- ══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- STEP 1: Delete orphaned profiles (auth user gone, profile left)
-- MUST run before Step 4 (FK add validates existing rows).
-- ──────────────────────────────────────────────
DELETE FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);

-- ──────────────────────────────────────────────
-- STEP 2: Harden the signup trigger
--  - Never fails the signup: resolves username collisions by
--    appending _1, _2, ... instead of throwing
--  - Sanitizes usernames (alnum + underscore, max 20 chars)
--  - Falls back to email local-part for OAuth users with no
--    username metadata
--  - ON CONFLICT (id) makes re-signup idempotent
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    SELECT 1 FROM profiles WHERE username = candidate AND id <> NEW.id
  ) LOOP
    suffix := suffix + 1;
    candidate := left(base_username, 15) || '_' || suffix::text;
  END LOOP;

  INSERT INTO profiles (id, username, full_name, created_at, updated_at)
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
  EXECUTE FUNCTION handle_new_user();

-- ──────────────────────────────────────────────
-- STEP 3: Unique index on username (case-insensitive)
-- Prevents two users claiming "aashir" / "Aashir".
-- NOTE: if this fails with "could not create unique index",
-- you have duplicate usernames among LIVE users — rename one:
--   UPDATE profiles SET username = username || '_2'
--   WHERE username = '<the-duplicate>' AND id <> '<keep-this-id>';
-- ──────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON profiles (lower(username));

-- ──────────────────────────────────────────────
-- STEP 4: Cascade profile deletion when auth user is deleted
-- Deleting a user in the dashboard now also removes their profile,
-- so the orphan problem can never happen again.
-- ──────────────────────────────────────────────
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- ══════════════════════════════════════════════════════════════
-- DONE. Test: sign up with a username that was previously taken —
-- it should now succeed (with a suffixed username if colliding)
-- instead of returning a 500.
-- ══════════════════════════════════════════════════════════════
