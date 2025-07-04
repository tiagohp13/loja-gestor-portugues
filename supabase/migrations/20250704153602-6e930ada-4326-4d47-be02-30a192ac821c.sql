-- Remove duplicate/conflicting RLS policies
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Update the existing policies to be more clear and functional
-- Allow users to update their own profiles (name, phone, avatar, language, theme)
CREATE OR REPLACE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to select their own profiles, and admins to select all profiles
CREATE OR REPLACE POLICY "Profile access policy"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id OR is_user_admin(auth.uid()));

-- Allow admins to update any profile (including access_level changes)
CREATE POLICY "Admins can manage all profiles"
ON user_profiles FOR UPDATE
USING (is_user_admin(auth.uid()));

-- Ensure users can insert their own profile
CREATE OR REPLACE POLICY "Users can create their own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);