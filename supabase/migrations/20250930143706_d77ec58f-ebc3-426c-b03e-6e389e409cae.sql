-- Add new fields to orders table for order type and delivery information
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'combined' CHECK (order_type IN ('combined', 'awaiting_stock')),
ADD COLUMN IF NOT EXISTS expected_delivery_date date,
ADD COLUMN IF NOT EXISTS expected_delivery_time time,
ADD COLUMN IF NOT EXISTS delivery_location text;

-- Add comment to describe the fields
COMMENT ON COLUMN public.orders.order_type IS 'Type of pending order: combined (Pendente - Combinada) or awaiting_stock (Pendente - A aguardar stock)';
COMMENT ON COLUMN public.orders.expected_delivery_date IS 'Expected delivery date (optional)';
COMMENT ON COLUMN public.orders.expected_delivery_time IS 'Expected delivery time (optional)';
COMMENT ON COLUMN public.orders.delivery_location IS 'Delivery or pickup location (optional)';