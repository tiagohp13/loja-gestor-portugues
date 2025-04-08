
-- Increment function to safely increment numeric values
CREATE OR REPLACE FUNCTION increment(row_id uuid, field_name text, inc numeric)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + $1 WHERE id = $2', 
                 TG_TABLE_NAME, field_name, field_name)
  USING inc, row_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to increment values
CREATE OR REPLACE FUNCTION public.increment(inc integer)
RETURNS integer AS $$
BEGIN
  RETURN inc;
END;
$$ LANGUAGE plpgsql;

-- Helper function to decrement values
CREATE OR REPLACE FUNCTION public.decrement(dec integer)
RETURNS integer AS $$
BEGIN
  RETURN -dec;
END;
$$ LANGUAGE plpgsql;
