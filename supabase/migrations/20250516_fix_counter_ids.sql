
-- Ensure we have the correct counter IDs for each document type
-- First, check if the counters table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'counters') THEN
    -- Update counter IDs to match what the code expects
    UPDATE public.counters SET id = 'order' WHERE id = 'order';
    UPDATE public.counters SET id = 'entry' WHERE id = 'stock_entry';
    UPDATE public.counters SET id = 'exit' WHERE id = 'stock_exit';
    
    -- Add any missing counters
    INSERT INTO public.counters (id, year, current_count)
    VALUES 
      ('order', EXTRACT(YEAR FROM NOW())::INTEGER, 
       (SELECT COALESCE(MAX(current_count), 0) FROM public.counters WHERE id = 'order')),
      ('entry', EXTRACT(YEAR FROM NOW())::INTEGER, 
       (SELECT COALESCE(MAX(current_count), 0) FROM public.counters WHERE id = 'entry')),
      ('exit', EXTRACT(YEAR FROM NOW())::INTEGER, 
       (SELECT COALESCE(MAX(current_count), 0) FROM public.counters WHERE id = 'exit'))
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Add comment explaining the counter system
COMMENT ON TABLE public.counters IS 'Stores counters for sequential numbering of documents (orders, entries, exits)';
