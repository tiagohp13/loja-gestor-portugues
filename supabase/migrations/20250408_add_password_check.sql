
-- Function to check if a password matches
CREATE OR REPLACE FUNCTION public.check_password(email TEXT, password_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_password TEXT;
  result BOOLEAN;
BEGIN
  SELECT password INTO stored_password FROM public.users WHERE email = check_password.email;
  
  IF stored_password IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- This assumes the password is stored using crypt() with bf algorithm
  RETURN stored_password = crypt(password_to_check, stored_password);
END;
$$;
