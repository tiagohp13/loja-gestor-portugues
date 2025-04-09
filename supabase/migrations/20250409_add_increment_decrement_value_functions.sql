
-- Function to increment a value in a specified table, column, and ID
CREATE OR REPLACE FUNCTION public.increment_value(
  p_table text,
  p_column text,
  p_id text,
  p_value integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result INTEGER;
  query TEXT;
BEGIN
  -- Build dynamic query to increment the value in the specified column
  query := format('UPDATE %I SET %I = %I + $1 WHERE id = $2 RETURNING %I', 
                  p_table, p_column, p_column, p_column);
  
  -- Execute the query
  EXECUTE query USING p_value, p_id INTO result;
  
  -- Return the new value
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in increment_value: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Function to decrement a value in a specified table, column, and ID
CREATE OR REPLACE FUNCTION public.decrement_value(
  p_table text,
  p_column text,
  p_id text,
  p_value integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result INTEGER;
  current_value INTEGER;
  query TEXT;
  update_query TEXT;
BEGIN
  -- First get the current value
  query := format('SELECT %I FROM %I WHERE id = $1', p_column, p_table);
  
  EXECUTE query USING p_id INTO current_value;
  
  -- Ensure we don't go below zero
  IF current_value - p_value < 0 THEN
    result := 0;
  ELSE
    result := current_value - p_value;
  END IF;
  
  -- Build dynamic query to update the value in the specified column
  update_query := format('UPDATE %I SET %I = $1 WHERE id = $2 RETURNING %I', 
                   p_table, p_column, p_column);
  
  -- Execute the update query
  EXECUTE update_query USING result, p_id INTO result;
  
  -- Return the new value
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in decrement_value: %', SQLERRM;
    RETURN NULL;
END;
$$;
