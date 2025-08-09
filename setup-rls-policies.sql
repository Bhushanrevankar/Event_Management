-- Row Level Security policies for the profiles table
-- This script sets up the necessary RLS policies to allow users to manage their own profiles

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile (optional)
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE 
  USING (auth.uid() = id);