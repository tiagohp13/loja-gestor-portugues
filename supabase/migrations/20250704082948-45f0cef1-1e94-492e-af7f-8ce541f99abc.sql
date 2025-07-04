-- Add new columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN theme TEXT DEFAULT 'system',
ADD COLUMN access_level TEXT DEFAULT 'visualizador' CHECK (access_level IN ('admin', 'editor', 'visualizador'));

-- Set specific user as admin
UPDATE public.user_profiles 
SET access_level = 'admin' 
WHERE email = 'tiagohp13@hotmail.com';

-- Create function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, access_level)
  VALUES (NEW.id, NEW.email, 'visualizador')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to check if user is admin (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = $1 AND access_level = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add new RLS policies for admin access to all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (public.is_user_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles" 
ON public.user_profiles 
FOR UPDATE 
USING (public.is_user_admin() OR auth.uid() = user_id);