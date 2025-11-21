-- Create user_audit_logs table for comprehensive user action tracking
CREATE TABLE IF NOT EXISTS public.user_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_user_audit_logs_target_user ON public.user_audit_logs(target_user_id);
CREATE INDEX idx_user_audit_logs_admin ON public.user_audit_logs(admin_id);
CREATE INDEX idx_user_audit_logs_timestamp ON public.user_audit_logs(timestamp DESC);

-- Enable RLS
ALTER TABLE public.user_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.user_audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
ON public.user_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Function to log user management actions
CREATE OR REPLACE FUNCTION public.log_user_audit(
  p_admin_id UUID,
  p_target_user_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_audit_logs (admin_id, target_user_id, action, details)
  VALUES (p_admin_id, p_target_user_id, p_action, p_details);
END;
$$;

COMMENT ON TABLE public.user_audit_logs IS 'Audit trail for all user management actions';
COMMENT ON FUNCTION public.log_user_audit IS 'Logs administrative actions on user accounts';