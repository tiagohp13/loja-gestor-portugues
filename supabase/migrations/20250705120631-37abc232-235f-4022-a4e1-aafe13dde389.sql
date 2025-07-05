-- Fix user_profiles access_level constraint and default value inconsistency

-- First, update any existing 'visualizador' values to 'viewer'
UPDATE public.user_profiles 
SET access_level = 'viewer' 
WHERE access_level = 'visualizador';

-- Drop the existing constraint
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_access_level_check;

-- Update the default value for access_level column to 'viewer'
ALTER TABLE public.user_profiles 
ALTER COLUMN access_level SET DEFAULT 'viewer';

-- Recreate the constraint with the correct values
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_access_level_check 
CHECK (access_level IN ('admin', 'editor', 'viewer'));

-- Update the handle_new_user function to use 'viewer' instead of any Portuguese terms
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, access_level)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;