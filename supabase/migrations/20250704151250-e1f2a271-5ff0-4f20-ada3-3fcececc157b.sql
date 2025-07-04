-- Standardize access_level values across the system
-- Convert 'visualizador' to 'viewer' for consistency

-- Update existing user profiles with old 'visualizador' value
UPDATE public.user_profiles 
SET access_level = 'viewer' 
WHERE access_level = 'visualizador';

-- Update the handle_new_user function to use 'viewer' as default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, access_level)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update the access_level check constraint to allow the new values
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_access_level_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_access_level_check 
CHECK (access_level IN ('admin', 'editor', 'viewer'));