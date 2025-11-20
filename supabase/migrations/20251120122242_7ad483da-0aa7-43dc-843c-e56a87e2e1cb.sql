-- Create a function to peek at the next counter without incrementing
CREATE OR REPLACE FUNCTION peek_next_counter_by_year(
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
  -- Get the current counter value without incrementing
  SELECT current_count + 1 INTO next_num
  FROM counters
  WHERE counters.counter_type = peek_next_counter_by_year.counter_type
    AND counters.year = p_year;
  
  -- If no counter exists yet, return 1
  IF next_num IS NULL THEN
    RETURN 1;
  END IF;
  
  RETURN next_num;
END;
$$;