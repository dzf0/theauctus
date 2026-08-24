-- ══════════════════════════════════════════════════════════════
-- THEAUCTUS SECURITY POLICIES
-- Run this in Supabase SQL Editor to enable RLS on all tables
-- ══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS connected_platforms ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════
-- PROFILES TABLE
-- ══════════════════════════════════════════════════════════════

-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile (signup trigger should handle this)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users cannot delete profiles (admin only)
CREATE POLICY "Users cannot delete profiles"
  ON profiles FOR DELETE
  USING (false);

-- ══════════════════════════════════════════════════════════════
-- POSTS TABLE
-- ══════════════════════════════════════════════════════════════

-- Users can only read their own posts
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create posts for themselves
CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- CONTENT CALENDARS TABLE
-- ══════════════════════════════════════════════════════════════

-- Users can only read their own calendars
CREATE POLICY "Users can view own calendars"
  ON content_calendars FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create calendars for themselves
CREATE POLICY "Users can create own calendars"
  ON content_calendars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own calendars
CREATE POLICY "Users can update own calendars"
  ON content_calendars FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own calendars
CREATE POLICY "Users can delete own calendars"
  ON content_calendars FOR DELETE
  USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- CONNECTED PLATFORMS TABLE
-- ══════════════════════════════════════════════════════════════

-- Users can only read their own connected platforms
CREATE POLICY "Users can view own platforms"
  ON connected_platforms FOR SELECT
  USING (auth.uid() = user_id);

-- Users can connect platforms for themselves
CREATE POLICY "Users can connect own platforms"
  ON connected_platforms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own platform connections
CREATE POLICY "Users can update own platforms"
  ON connected_platforms FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can disconnect their own platforms
CREATE POLICY "Users can disconnect own platforms"
  ON connected_platforms FOR DELETE
  USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS (if using Supabase Storage)
-- ══════════════════════════════════════════════════════════════

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;

-- Avatar storage policies
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Media storage policies (private)
CREATE POLICY "Users can upload own media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ══════════════════════════════════════════════════════════════
-- DATABASE FUNCTIONS (Security Definer)
-- ══════════════════════════════════════════════════════════════

-- Function to check username availability (prevents enumeration)
CREATE OR REPLACE FUNCTION check_username_available(username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles WHERE profiles.username = username
  );
END;
$$;

-- Function to create profile on signup (trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, user_id, username, full_name, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ══════════════════════════════════════════════════════════════
-- AUDIT LOG TABLE (optional but recommended)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_log FOR SELECT
  USING (false); -- Implement admin check here

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_content_calendars_user_id ON content_calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_platforms_user_id ON connected_platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
