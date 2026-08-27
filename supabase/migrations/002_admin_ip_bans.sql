-- IP bans table for admin moderation
CREATE TABLE IF NOT EXISTS public.ip_bans (
  identifier UUID PRIMARY KEY,
  reason TEXT NOT NULL DEFAULT '',
  banned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.ip_bans ENABLE ROW LEVEL SECURITY;

-- Only service role (admin API) can access ip_bans
CREATE POLICY "Service role full access on ip_bans"
  ON public.ip_bans
  FOR ALL
  USING (true)
  WITH CHECK (true);
