-- ══════════════════════════════════════════════════════════════
-- Migration 001: Platform Publishing
-- Adds OAuth token expiry, expands platform support, adds
-- platform_post_id for tracking published posts.
-- ══════════════════════════════════════════════════════════════

-- ── Expand connected_platforms ───────────────────────────────
-- Add new columns
ALTER TABLE public.connected_platforms
  ADD COLUMN IF NOT EXISTS token_expires_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS platform_user_id  TEXT,
  ADD COLUMN IF NOT EXISTS platform_name     TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url        TEXT;

-- Expand platform CHECK constraint to include all supported platforms
ALTER TABLE public.connected_platforms
  DROP CONSTRAINT IF EXISTS connected_platforms_platform_check;

ALTER TABLE public.connected_platforms
  ADD CONSTRAINT connected_platforms_platform_check
  CHECK (platform IN (
    'instagram', 'tiktok', 'youtube', 'twitter', 'linkedin',
    'threads', 'facebook', 'blog'
  ));

-- ── Add platform_post_id to posts ────────────────────────────
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS platform_post_id TEXT,
  ADD COLUMN IF NOT EXISTS publish_error    TEXT,
  ADD COLUMN IF NOT EXISTS media_urls       TEXT[];

-- ── Index for the cron scheduler ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_publish
  ON public.posts(user_id, status, scheduled_at)
  WHERE status = 'scheduled';
