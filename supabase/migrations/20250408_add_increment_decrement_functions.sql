
-- Create a function to increment a value
CREATE OR REPLACE FUNCTION public.increment(inc integer)
RETURNS integer
LANGUAGE SQL
AS $$
  SELECT $1;
$$;

-- Create a function to decrement a value
CREATE OR REPLACE FUNCTION public.decrement(dec integer)
RETURNS integer
LANGUAGE SQL
AS $$
  SELECT $1;
$$;

-- Create a function to get the next counter value
CREATE OR REPLACE FUNCTION public.get_next_counter(counter_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_year INTEGER;
  next_count INTEGER;
  formatted_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Check if counter exists for this ID
  IF NOT EXISTS (SELECT 1 FROM public.counters WHERE id = counter_id) THEN
    -- Insert a new counter
    INSERT INTO public.counters (id, year, current_count)
    VALUES (counter_id, current_year, 0);
  END IF;
  
  -- Check if year has changed and reset counter if needed
  UPDATE public.counters
  SET year = current_year, current_count = CASE WHEN year != current_year THEN 0 ELSE current_count END
  WHERE id = counter_id;
  
  -- Increment counter and get the new value
  UPDATE public.counters
  SET current_count = current_count + 1
  WHERE id = counter_id
  RETURNING current_count INTO next_count;
  
  -- Format the counter with leading zeros (e.g., 2025/001)
  formatted_number := current_year || '/' || LPAD(next_count::TEXT, 3, '0');
  
  RETURN formatted_number;
END;
$$;

-- Create counters table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.counters (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  current_count INTEGER NOT NULL DEFAULT 0
);

-- Insert initial counters if they don't exist
INSERT INTO public.counters (id, year, current_count)
VALUES
  ('order', EXTRACT(YEAR FROM NOW())::INTEGER, 0),
  ('entry', EXTRACT(YEAR FROM NOW())::INTEGER, 0),
  ('exit', EXTRACT(YEAR FROM NOW())::INTEGER, 0)
ON CONFLICT (id) DO NOTHING;

