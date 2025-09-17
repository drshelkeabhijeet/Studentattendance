/*
  # Fix Profile Creation Issues

  1. Security
    - Drop existing problematic policies
    - Create simplified, working policies
    - Ensure profile creation works during signup

  2. Changes
    - Remove complex policies causing issues
    - Add simple, effective policies
    - Enable profile creation for new users
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Administrators can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Faculty can view students" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new, simplified policies
CREATE POLICY "Enable insert for authenticated users during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users on their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users on their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policy (separate and simple)
CREATE POLICY "Enable all for administrators"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'administrator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'administrator'
    )
  );

-- Faculty can view students (simple policy)
CREATE POLICY "Enable select for faculty on students"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    role = 'student' 
    AND EXISTS (
      SELECT 1 FROM profiles faculty_profile 
      WHERE faculty_profile.id = auth.uid() 
      AND faculty_profile.role = 'faculty'
    )
  );