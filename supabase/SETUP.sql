-- ══════════════════════════════════════════════════════════════
-- THEAUCTUS — COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor.
-- Every statement is idempotent (safe to re-run).
-- ══════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════════════════════
-- 1. TABLES
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email           TEXT,
  name            TEXT,
  full_name       TEXT,
  avatar_url      TEXT,
  username        TEXT,
  niche                TEXT,
  brand_voice          TEXT,
  target_audience      TEXT,
  goals                TEXT,
  keywords             TEXT[],
  tone_preferences     TEXT[],
  content_goals        TEXT[],
  posting_frequency    TEXT,
  example_posts        TEXT[],
  brand_fingerprint    JSONB,
  onboarded            BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent ADD COLUMN for columns that may not exist on older DBs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='username') THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='tone_preferences') THEN
    ALTER TABLE public.profiles ADD COLUMN tone_preferences TEXT[]; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='content_goals') THEN
    ALTER TABLE public.profiles ADD COLUMN content_goals TEXT[]; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='posting_frequency') THEN
    ALTER TABLE public.profiles ADD COLUMN posting_frequency TEXT; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='example_posts') THEN
    ALTER TABLE public.profiles ADD COLUMN example_posts TEXT[]; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='brand_fingerprint') THEN
    ALTER TABLE public.profiles ADD COLUMN brand_fingerprint JSONB; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='onboarded') THEN
    ALTER TABLE public.profiles ADD COLUMN onboarded BOOLEAN DEFAULT FALSE; END IF;
END $$;

-- Back-fill: set email from auth.users if profiles.email is null
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL AND u.email IS NOT NULL;

-- Back-fill full_name from name
UPDATE public.profiles SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL AND name != '';

-- Unique constraint on username (guarded)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass AND contype = 'u'
    AND EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attnum = ANY(conkey) AND attname = 'username')
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── subscriptions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                 UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan                    TEXT DEFAULT 'starter',
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  status                  TEXT DEFAULT 'active',
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ── connected_platforms ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.connected_platforms (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform      TEXT NOT NULL,
  username      TEXT,
  access_token  TEXT,
  refresh_token TEXT,
  followers     INTEGER DEFAULT 0,
  connected     BOOLEAN DEFAULT FALSE,
  last_sync     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- ── content_calendars ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_calendars (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month         INTEGER NOT NULL,
  year          INTEGER NOT NULL,
  generated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- ── posts ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  calendar_id   UUID REFERENCES public.content_calendars(id) ON DELETE SET NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  platform      TEXT NOT NULL,
  content_type  TEXT NOT NULL DEFAULT 'post',
  status        TEXT DEFAULT 'draft',
  scheduled_at  TIMESTAMPTZ,
  published_at  TIMESTAMPTZ,
  hashtags      TEXT[],
  ai_generated  BOOLEAN DEFAULT TRUE,
  likes       INTEGER DEFAULT 0,
  comments    INTEGER DEFAULT 0,
  shares      INTEGER DEFAULT 0,
  saves       INTEGER DEFAULT 0,
  reach       INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks      INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── credit_balances ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.credit_balances (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance             INTEGER DEFAULT 0,
  bonus_credits       INTEGER DEFAULT 0,
  bonus_expires_at    TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='credit_balances' AND column_name='bonus_credits') THEN
    ALTER TABLE public.credit_balances ADD COLUMN bonus_credits INTEGER DEFAULT 0; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='credit_balances' AND column_name='bonus_expires_at') THEN
    ALTER TABLE public.credit_balances ADD COLUMN bonus_expires_at TIMESTAMPTZ; END IF;
END $$;

-- ── credit_history ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.credit_history (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount        INTEGER NOT NULL,
  type          TEXT NOT NULL,
  description   TEXT,
  reference_id  UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── ip_bans (used by admin ban system) ────────────────────────
CREATE TABLE IF NOT EXISTS public.ip_bans (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  identifier  TEXT NOT NULL,
  reason      TEXT,
  banned_by   UUID,
  banned_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ip_bans_identifier ON public.ip_bans (identifier);

-- ── audit_log ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- 2. CLEAN UP ORPHANED ROWS
-- ══════════════════════════════════════════════════════════════

DELETE FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);

-- ══════════════════════════════════════════════════════════════
-- 3. ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.connected_platforms  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.content_calendars    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_balances      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_history       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ip_bans              ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Users cannot delete profiles"  ON public.profiles;
CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT  USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users cannot delete profiles"  ON public.profiles FOR DELETE USING (false);

-- subscriptions
DROP POLICY IF EXISTS "Users can view own subscription"    ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription"  ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription"  ON public.subscriptions;
CREATE POLICY "Users can view own subscription"    ON public.subscriptions FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription"  ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription"  ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- connected_platforms
DROP POLICY IF EXISTS "Users can view own platforms"       ON public.connected_platforms;
DROP POLICY IF EXISTS "Users can connect own platforms"    ON public.connected_platforms;
DROP POLICY IF EXISTS "Users can update own platforms"     ON public.connected_platforms;
DROP POLICY IF EXISTS "Users can disconnect own platforms" ON public.connected_platforms;
CREATE POLICY "Users can view own platforms"       ON public.connected_platforms FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "Users can connect own platforms"    ON public.connected_platforms FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own platforms"     ON public.connected_platforms FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "Users can disconnect own platforms" ON public.connected_platforms FOR DELETE  USING (auth.uid() = user_id);

-- content_calendars
DROP POLICY IF EXISTS "Users can view own calendars"    ON public.content_calendars;
DROP POLICY IF EXISTS "Users can create own calendars"  ON public.content_calendars;
DROP POLICY IF EXISTS "Users can update own calendars"  ON public.content_calendars;
DROP POLICY IF EXISTS "Users can delete own calendars"  ON public.content_calendars;
CREATE POLICY "Users can view own calendars"    ON public.content_calendars FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "Users can create own calendars"  ON public.content_calendars FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendars"  ON public.content_calendars FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendars"  ON public.content_calendars FOR DELETE  USING (auth.uid() = user_id);

-- posts
DROP POLICY IF EXISTS "Users can view own posts"    ON public.posts;
DROP POLICY IF EXISTS "Users can create own posts"  ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts"  ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts"  ON public.posts;
CREATE POLICY "Users can view own posts"    ON public.posts FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "Users can create own posts"  ON public.posts FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts"  ON public.posts FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts"  ON public.posts FOR DELETE  USING (auth.uid() = user_id);

-- credit_balances
DROP POLICY IF EXISTS "Users can view own credit balance"    ON public.credit_balances;
DROP POLICY IF EXISTS "Users can update own credit balance"  ON public.credit_balances;
DROP POLICY IF EXISTS "Users can insert own credit balance"  ON public.credit_balances;
CREATE POLICY "Users can view own credit balance"    ON public.credit_balances FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own credit balance"  ON public.credit_balances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credit balance"  ON public.credit_balances FOR INSERT WITH CHECK (auth.uid() = user_id);

-- credit_history
DROP POLICY IF EXISTS "Users can view own credit history"   ON public.credit_history;
DROP POLICY IF EXISTS "Users can insert own credit history" ON public.credit_history;
CREATE POLICY "Users can view own credit history"   ON public.credit_history FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credit history" ON public.credit_history FOR INSERT  WITH CHECK (auth.uid() = user_id);

-- audit_log (admin-only via service-role, no user-level RLS)
DROP POLICY IF EXISTS "Admins can view audit logs"   ON public.audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;
CREATE POLICY "Admins can view audit logs"   ON public.audit_log FOR SELECT  USING (false);
CREATE POLICY "System can insert audit logs" ON public.audit_log FOR INSERT  WITH CHECK (true);

-- ip_bans (service-role only)
DROP POLICY IF EXISTS "Service role manages ip_bans" ON public.ip_bans;
CREATE POLICY "Service role manages ip_bans" ON public.ip_bans FOR ALL USING (false);

-- ══════════════════════════════════════════════════════════════
-- 4. STORAGE BUCKETS
-- ══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true), ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars"     ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own media"  ON storage.objects;
DROP POLICY IF EXISTS "Users can view own media"    ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media"  ON storage.objects;

CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view avatars"     ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload own media"  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own media"    ON storage.objects FOR SELECT
  USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own media"  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ══════════════════════════════════════════════════════════════
-- 5. FUNCTIONS & TRIGGERS
-- ══════════════════════════════════════════════════════════════

-- Drop existing functions first (CREATE OR REPLACE can't rename parameters)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.check_username_available(text);
DROP FUNCTION IF EXISTS public.check_username_available(p_username text);
DROP FUNCTION IF EXISTS public.increment_balance(uuid, integer);
DROP FUNCTION IF EXISTS public.decrement_balance(uuid, integer);
DROP FUNCTION IF EXISTS public.expire_bonus_credits(uuid);
DROP FUNCTION IF EXISTS public.deduct_credits_with_bonus(uuid, integer);

-- ── handle_new_user: auto-create profile, subscription, credits on signup ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $func$
DECLARE
  base_username TEXT;
  candidate     TEXT;
  suffix        INT := 0;
BEGIN
  base_username := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'username', ''),
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'user'
  );

  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g');
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'user';
  END IF;
  base_username := lower(left(base_username, 20));

  candidate := base_username;
  WHILE EXISTS (
    SELECT 1 FROM public.profiles WHERE username = candidate AND id <> NEW.id
  ) LOOP
    suffix   := suffix + 1;
    candidate := left(base_username, 15) || '_' || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, email, username, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    candidate,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET email      = COALESCE(EXCLUDED.email, public.profiles.email),
        username   = EXCLUDED.username,
        full_name  = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = NOW();

  INSERT INTO public.subscriptions (user_id, plan)
  VALUES (NEW.id, 'starter')
  ON CONFLICT (user_id) DO NOTHING;

  -- 10 free credits + 50 trial bonus credits (expire in 7 days)
  INSERT INTO public.credit_balances (user_id, balance, bonus_credits, bonus_expires_at)
  VALUES (NEW.id, 10, 50, NOW() + INTERVAL '7 days')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── check_username_available ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(username) = lower(p_username)
  );
END;
$func$;

-- ── increment_balance: atomic credit add (upsert) ──────────────
CREATE OR REPLACE FUNCTION public.increment_balance(p_user_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  INSERT INTO public.credit_balances (user_id, balance, updated_at)
  VALUES (p_user_id, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.credit_balances.balance + p_amount,
        updated_at = NOW();
END;
$func$;

-- ── decrement_balance: atomic credit subtract (clamps to 0) ────
CREATE OR REPLACE FUNCTION public.decrement_balance(p_user_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  UPDATE public.credit_balances
  SET balance = GREATEST(balance - p_amount, 0),
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$func$;

-- ── expire_bonus_credits: lazy expiry ──────────────────────────
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

-- ── deduct_credits_with_bonus: spend bonus first, then regular ─
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

-- ══════════════════════════════════════════════════════════════
-- 6. INDEXES
-- ══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_profiles_id                    ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_username              ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarded             ON public.profiles(onboarded);
CREATE INDEX IF NOT EXISTS idx_posts_user_id                  ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status                   ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at             ON public.posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_content_calendars_user_id      ON public.content_calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_platforms_user_id    ON public.connected_platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_balances_user_id        ON public.credit_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_history_user_id         ON public.credit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_history_created_at      ON public.credit_history(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id              ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at           ON public.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_action               ON public.audit_log(action);

-- Unique username index (guarded against existing duplicates)
DO $$
DECLARE dup_count INT;
BEGIN
  SELECT count(*) INTO dup_count FROM (
    SELECT lower(username) AS u FROM public.profiles
    WHERE username IS NOT NULL
    GROUP BY lower(username) HAVING count(*) > 1
  ) d;

  IF dup_count > 0 THEN
    RAISE NOTICE 'SKIPPED unique username index: % duplicate(s) exist. Rename duplicates, then re-run.', dup_count;
  ELSE
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (lower(username))';
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- 7. RETROACTIVE CREDITS FOR EXISTING USERS
-- ══════════════════════════════════════════════════════════════
-- The trigger only fires on NEW signups. Existing users who
-- signed up before this SQL was run need credits granted now.
-- Uses ON CONFLICT DO NOTHING so it's safe to re-run.

-- Give 10 free credits + 50 trial bonus credits to users
-- who have a profile but NO credit_balances row yet.
INSERT INTO public.credit_balances (user_id, balance, bonus_credits, bonus_expires_at)
SELECT p.id, 10, 50, NOW() + INTERVAL '7 days'
FROM public.profiles p
LEFT JOIN public.credit_balances cb ON cb.user_id = p.id
WHERE cb.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Also grant credits to users who have a row but balance is 0
-- and no bonus_credits (they were created but never got the welcome bonus)
UPDATE public.credit_balances
SET balance = GREATEST(balance, 10),
    bonus_credits = GREATEST(bonus_credits, 50),
    bonus_expires_at = CASE
      WHEN bonus_expires_at IS NULL OR bonus_expires_at < NOW()
      THEN NOW() + INTERVAL '7 days'
      ELSE bonus_expires_at
    END,
    updated_at = NOW()
WHERE balance = 0 AND (bonus_credits = 0 OR bonus_credits IS NULL);

-- ══════════════════════════════════════════════════════════════
-- DONE
-- ══════════════════════════════════════════════════════════════
