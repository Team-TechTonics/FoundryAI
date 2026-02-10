-- =====================================================
-- FIX RLS POLICIES FOR USER SIGNUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Allow service role to insert users (for signup)
CREATE POLICY "Enable insert for service role" ON users
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE 
  USING (auth.uid() = id);

-- Alternatively, you can temporarily disable RLS during development:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- 
-- Remember to re-enable it later:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
