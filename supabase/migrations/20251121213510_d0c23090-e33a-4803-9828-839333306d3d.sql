-- Create table for user activity logs
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_description text NOT NULL,
  entity_type text,
  entity_id uuid,
  entity_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs"
ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can insert activity logs
CREATE POLICY "System can insert activity logs"
ON public.user_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_user_activity_logs_entity ON public.user_activity_logs(entity_type, entity_id);

-- Helper function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id uuid,
  p_action_type text,
  p_action_description text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_entity_name text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id,
    action_type,
    action_description,
    entity_type,
    entity_id,
    entity_name
  ) VALUES (
    p_user_id,
    p_action_type,
    p_action_description,
    p_entity_type,
    p_entity_id,
    p_entity_name
  );
END;
$$;