-- Ensure products table has REPLICA IDENTITY FULL for realtime updates
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- Ensure products table is in the realtime publication
DO $$
BEGIN
  -- Check if publication exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  -- Add products table to publication if not already included
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;