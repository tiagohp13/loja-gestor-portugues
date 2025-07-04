-- Remove all existing RLS policies for user_profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;

-- Create cleaner, non-conflicting RLS policies

-- Allow users to select their own profiles, and admins to select all profiles
CREATE POLICY "Profile select policy"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id OR is_user_admin(auth.uid()));

-- Allow users to update their own profiles (name, phone, avatar, language, theme)
-- Allow admins to update any profile
CREATE POLICY "Profile update policy"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id OR is_user_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id OR is_user_admin(auth.uid()));

-- Allow users to insert their own profile
CREATE POLICY "Profile insert policy"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own profile (optional)
CREATE POLICY "Profile delete policy"
ON user_profiles FOR DELETE
USING (auth.uid() = user_id OR is_user_admin(auth.uid()));