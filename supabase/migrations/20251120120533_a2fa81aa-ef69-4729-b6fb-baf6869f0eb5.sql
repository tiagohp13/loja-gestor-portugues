
-- Fix the counter for stock_entries to match the actual highest number
UPDATE counters 
SET current_count = 20, 
    last_number = 20,
    updated_at = now()
WHERE counter_type = 'stock_entries' 
  AND year = 2025;

-- Recreate the get_next_counter_by_year function to ensure it works correctly
CREATE OR REPLACE FUNCTION get_next_counter_by_year(
  counter_type text,
  p_year integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_num integer;
BEGIN
  -- Insert a new counter if it doesn't exist
  INSERT INTO counters (counter_type, year, current_count, last_number)
  VALUES (counter_type, p_year, 0, 0)
  ON CONFLICT (counter_type, year) DO NOTHING;

  -- Update and return the next number
  UPDATE counters
  SET current_count = current_count + 1,
      last_number = current_count + 1,
      updated_at = now()
  WHERE counters.counter_type = get_next_counter_by_year.counter_type
    AND counters.year = p_year
  RETURNING last_number INTO next_num;

  RETURN next_num;
END;
$$;
