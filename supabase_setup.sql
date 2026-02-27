-- =============================================
-- SKILL MATRIMONY — Complete Supabase Setup
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================

-- ============================================
-- 1. PROFILES TABLE
-- Stores student/publisher profile data
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  college TEXT,
  university TEXT,
  branch TEXT DEFAULT 'Computer Science',
  semester TEXT DEFAULT '1st Semester',
  graduation_year INTEGER,
  bio TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'publisher')),
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);


-- ============================================
-- 2. EVENTS TABLE
-- Stores inter-college events published by users
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  college TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT DEFAULT 'TBA',
  category TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read events
CREATE POLICY "Authenticated users can view events" ON events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can create events
CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ============================================
-- 3. QUIZ RESULTS TABLE
-- Stores exam prep quiz scores
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);

-- Enable Row Level Security
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own quiz results
CREATE POLICY "Users can view own quiz results" ON quiz_results
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert quiz results
CREATE POLICY "Authenticated users can insert quiz results" ON quiz_results
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- =============================================
-- DONE! All 3 tables created:
--   ✅ profiles  (user profile data)
--   ✅ events    (inter-college events)
--   ✅ quiz_results (exam prep scores)
-- =============================================
