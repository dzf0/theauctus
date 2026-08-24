-- Brand Profile Setup for TheAuctus
-- Run this in Supabase SQL Editor

-- Add brand profile columns to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS niche TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS brand_voice TEXT CHECK (brand_voice IN ('professional', 'casual', 'humorous', 'inspirational', 'educational'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tone_preferences TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS content_goals TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS posting_frequency TEXT CHECK (posting_frequency IN ('daily', '3-5x-week', '1-2x-week', 'weekly'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS example_posts TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS brand_fingerprint JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE;

-- Add username column if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarded ON public.profiles(onboarded);

-- Update the handle_new_user function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  
  -- Create default subscription
  INSERT INTO public.subscriptions (user_id, plan)
  VALUES (NEW.id, 'starter');
  
  -- Create default credit balance (10 free credits)
  INSERT INTO public.credit_balances (user_id, balance)
  VALUES (NEW.id, 10);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create credit_balances table if not exists
CREATE TABLE IF NOT EXISTS public.credit_balances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_history table if not exists
CREATE TABLE IF NOT EXISTS public.credit_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'refund', 'usage', 'bonus')),
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for credit tables
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit balance" ON public.credit_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credit balance" ON public.credit_balances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit balance" ON public.credit_balances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own credit history" ON public.credit_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit history" ON public.credit_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
