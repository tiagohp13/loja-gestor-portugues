-- Create table for suspension history
CREATE TABLE IF NOT EXISTS public.user_suspension_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('suspended', 'reactivated')),
  reason text,
  performed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_suspension_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all suspension history
CREATE POLICY "Admins can view suspension history"
ON public.user_suspension_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can insert suspension history
CREATE POLICY "Admins can insert suspension history"
ON public.user_suspension_history
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_user_suspension_history_user_id ON public.user_suspension_history(user_id);
CREATE INDEX idx_user_suspension_history_created_at ON public.user_suspension_history(created_at DESC);