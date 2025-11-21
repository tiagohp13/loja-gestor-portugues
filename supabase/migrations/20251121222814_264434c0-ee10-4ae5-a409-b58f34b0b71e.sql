-- Create table for failed login attempts
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  ip_address text,
  user_agent text,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email_timestamp 
ON public.failed_login_attempts(email, timestamp DESC);

-- Enable RLS
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policy: only admins can view failed login attempts
CREATE POLICY "Admins can view failed login attempts"
ON public.failed_login_attempts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS policy: system can insert failed login attempts
CREATE POLICY "System can insert failed login attempts"
ON public.failed_login_attempts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add access expiration field to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS access_expires_at timestamptz;

-- Function to check and suspend expired users
CREATE OR REPLACE FUNCTION public.check_and_suspend_expired_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Suspend users whose access has expired
  UPDATE public.user_profiles
  SET is_suspended = true
  WHERE access_expires_at IS NOT NULL
    AND access_expires_at < now()
    AND is_suspended = false;
    
  -- Log audit for each suspended user
  INSERT INTO public.user_audit_logs (admin_id, target_user_id, action, details)
  SELECT 
    user_id, -- Using system as admin
    user_id,
    'auto_suspended',
    jsonb_build_object('reason', 'access_expired', 'expired_at', access_expires_at)
  FROM public.user_profiles
  WHERE access_expires_at IS NOT NULL
    AND access_expires_at < now()
    AND is_suspended = true
    AND NOT EXISTS (
      SELECT 1 FROM public.user_audit_logs 
      WHERE target_user_id = user_profiles.user_id 
      AND action = 'auto_suspended'
      AND timestamp > access_expires_at
    );
END;
$$;

-- Function to log failed login and check for auto-suspension
CREATE OR REPLACE FUNCTION public.log_failed_login_attempt(
  p_email text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_reason text DEFAULT 'incorrect_password'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt_count integer;
  v_user_id uuid;
  v_should_suspend boolean := false;
BEGIN
  -- Insert failed attempt
  INSERT INTO public.failed_login_attempts (email, ip_address, user_agent, reason)
  VALUES (p_email, p_ip_address, p_user_agent, p_reason);
  
  -- Count recent failed attempts (last 20 minutes)
  SELECT COUNT(*) INTO v_attempt_count
  FROM public.failed_login_attempts
  WHERE email = p_email
    AND timestamp > now() - interval '20 minutes';
  
  -- If 5 or more attempts, suspend the user
  IF v_attempt_count >= 5 THEN
    -- Find user_id by email
    SELECT user_id INTO v_user_id
    FROM public.user_profiles
    WHERE email = p_email;
    
    IF v_user_id IS NOT NULL THEN
      -- Suspend user
      UPDATE public.user_profiles
      SET is_suspended = true
      WHERE user_id = v_user_id
        AND is_suspended = false;
      
      -- Log audit
      INSERT INTO public.user_audit_logs (admin_id, target_user_id, action, details)
      VALUES (
        v_user_id, -- system action
        v_user_id,
        'auto_suspended',
        jsonb_build_object(
          'reason', 'excessive_failed_login_attempts',
          'attempt_count', v_attempt_count,
          'window_minutes', 20
        )
      );
      
      v_should_suspend := true;
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'attempt_count', v_attempt_count,
    'suspended', v_should_suspend,
    'limit_reached', v_attempt_count >= 5
  );
END;
$$;