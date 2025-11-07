-- Create notifications table with professional structure
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('stock', 'order', 'request', 'expense', 'client', 'supplier', 'general')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  link text,
  read boolean NOT NULL DEFAULT false,
  archived boolean NOT NULL DEFAULT false,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications or all if admin
CREATE POLICY "Users can view their notifications"
ON public.notifications
FOR SELECT
USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Users can insert their own notifications
CREATE POLICY "Users can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, archive)
CREATE POLICY "Users can update their notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_archived ON public.notifications(archived);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to auto-archive expired notifications
CREATE OR REPLACE FUNCTION public.archive_expired_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET archived = true, updated_at = now()
  WHERE expires_at < now() AND archived = false;
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_notifications_timestamp
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_notifications_updated_at();