
-- Function to increment a value in a specified column
CREATE OR REPLACE FUNCTION public.increment_value(inc integer, col_name text)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (COALESCE(current_setting('temp.value', true)::integer, 0) + inc);
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$;

-- Function to decrement a value in a specified column
CREATE OR REPLACE FUNCTION public.decrement_value(dec integer, col_name text)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN greatest(0, (COALESCE(current_setting('temp.value', true)::integer, 0) - dec));
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$;
