
-- Drop the existing versions of the function
DROP FUNCTION IF EXISTS public.table_exists(text);
DROP FUNCTION IF EXISTS public.table_exists(text, text);

-- Create the new, more secure version
CREATE OR REPLACE FUNCTION public.table_exists(schema_name text, table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = schema_name
          AND table_name = table_exists.table_name
    );
END;
$$;

-- Add a comment explaining the function's purpose and security considerations
COMMENT ON FUNCTION public.table_exists(text, text) IS 'Checks if a table exists in the specified schema. Uses SECURITY INVOKER and has a fixed search_path for improved security.';
