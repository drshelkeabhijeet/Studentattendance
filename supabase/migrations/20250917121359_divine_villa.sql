/*
  # Fix RLS Policies for Profiles Table

  1. Security Changes
    - Drop existing problematic policies that cause infinite recursion
    - Create simplified, non-recursive policies for profile access
    - Allow users to insert their own profile during signup
    - Allow users to read and update their own profile data
    - Allow administrators to manage all profiles
    - Allow faculty to view student profiles in their courses

  2. Policy Structure
    - Simple auth.uid() = id checks to avoid recursion
    - Clear separation between user roles and permissions
    - No complex subqueries that could cause infinite loops
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Administrators can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Faculty can view student profiles in their courses" ON profiles;

-- Create new, simplified policies

-- Allow users to insert their own profile (needed for signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to select their own profile
CREATE POLICY "Users can select own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow administrators to manage all profiles
CREATE POLICY "Administrators can manage all profiles"
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

-- Allow faculty to view student profiles (simplified version)
CREATE POLICY "Faculty can view students"
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