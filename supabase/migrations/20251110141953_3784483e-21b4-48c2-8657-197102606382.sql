-- Add related_id field to notifications for better deduplication
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS related_id uuid;

-- Add index for faster deduplication queries
CREATE INDEX IF NOT EXISTS idx_notifications_active_lookup 
ON public.notifications(type, related_id, archived) 
WHERE archived = false;

-- Add index for faster link lookups
CREATE INDEX IF NOT EXISTS idx_notifications_link 
ON public.notifications(link) 
WHERE archived = false;

COMMENT ON COLUMN public.notifications.related_id IS 'ID of the related entity (product_id, order_id, etc) for deduplication';