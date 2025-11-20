-- Fix ambiguous column reference in get_next_counter_by_year function
CREATE OR REPLACE FUNCTION get_next_counter_by_year(counter_type text, p_year integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_number integer;
BEGIN
  -- Lock the row for update
  SELECT current_count + 1 INTO next_number
  FROM counters
  WHERE counters.counter_type = get_next_counter_by_year.counter_type 
    AND counters.year = p_year
  FOR UPDATE;

  -- If no counter exists for this year, create it
  IF NOT FOUND THEN
    INSERT INTO counters (counter_type, year, current_count, last_number)
    VALUES (get_next_counter_by_year.counter_type, p_year, 1, 1);
    RETURN 1;
  END IF;

  -- Update the counter
  UPDATE counters
  SET current_count = next_number,
      last_number = next_number,
      updated_at = now()
  WHERE counters.counter_type = get_next_counter_by_year.counter_type 
    AND counters.year = p_year;

  RETURN next_number;
END;
$$;