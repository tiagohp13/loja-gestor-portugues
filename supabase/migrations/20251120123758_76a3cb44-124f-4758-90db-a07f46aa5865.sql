-- Fix security issues: Add search_path to functions without it
-- This prevents SQL injection attacks via search_path manipulation

-- Fix peek_next_counter_by_year
CREATE OR REPLACE FUNCTION peek_next_counter_by_year(
  counter_type text,
  p_year integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num integer;
BEGIN
  SELECT current_count + 1 INTO next_num
  FROM counters
  WHERE counters.counter_type = peek_next_counter_by_year.counter_type
    AND counters.year = p_year;
  
  IF next_num IS NULL THEN
    RETURN 1;
  END IF;
  
  RETURN next_num;
END;
$$;

-- Fix get_next_counter_by_year
CREATE OR REPLACE FUNCTION get_next_counter_by_year(
  counter_type text,
  p_year integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num integer;
BEGIN
  INSERT INTO counters (counter_type, year, current_count, last_number)
  VALUES (counter_type, p_year, 0, 0)
  ON CONFLICT (counter_type, year) DO NOTHING;

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

-- Fix generate_padded_sequence (if it exists)
DROP FUNCTION IF EXISTS generate_padded_sequence(json, text);
DROP FUNCTION IF EXISTS generate_padded_sequence(jsonb, text);