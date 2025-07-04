-- Fix Function Search Path Mutable security warnings
-- Set secure search_path for all affected functions

-- Fix is_user_admin function
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = $1 AND access_level = 'admin'
  );
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, access_level)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix get_user_access_level function
CREATE OR REPLACE FUNCTION public.get_user_access_level(user_id uuid DEFAULT auth.uid())
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (
    SELECT access_level 
    FROM public.user_profiles 
    WHERE user_profiles.user_id = $1
  );
END;
$$;

-- Fix can_write_data function
CREATE OR REPLACE FUNCTION public.can_write_data(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN public.get_user_access_level($1) IN ('admin', 'editor');
END;
$$;

-- Fix can_delete_data function
CREATE OR REPLACE FUNCTION public.can_delete_data(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN public.get_user_access_level($1) = 'admin';
END;
$$;

-- Fix table_exists function
CREATE OR REPLACE FUNCTION public.table_exists(schema_name text, table_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path = public, pg_temp
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

-- Fix single parameter table_exists function
CREATE OR REPLACE FUNCTION public.table_exists(table_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = table_exists.table_name
    );
END;
$$;

-- Fix generate_padded_sequence function
CREATE OR REPLACE FUNCTION public.generate_padded_sequence(items json, prefix text DEFAULT ''::text)
 RETURNS TABLE(id text, new_number text)
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $$
DECLARE
  item_record RECORD;
  item_id TEXT;
  item_year INTEGER;
  counter_type TEXT;
  formatted_number TEXT;
BEGIN
  FOR item_record IN SELECT * FROM json_array_elements(items)
  LOOP
    -- Extrair id e ano do item
    item_id := item_record.value->>'id';
    item_year := (item_record.value->>'year')::INTEGER;
    counter_type := item_record.value->>'type';
    
    -- Obter próximo número na sequência para este ano e tipo
    formatted_number := get_next_counter_by_year(counter_type, item_year);
    
    -- Retornar o resultado
    id := item_id;
    new_number := formatted_number;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Fix get_next_counter_by_year function
CREATE OR REPLACE FUNCTION public.get_next_counter_by_year(counter_id text, target_year integer)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $$
DECLARE
  next_count INTEGER;
  formatted_number TEXT;
  prefix TEXT;
BEGIN
  -- Determinar o prefixo com base no counter_id
  IF counter_id = 'exit' THEN
    prefix := 'VEN-';
  ELSIF counter_id = 'entry' THEN
    prefix := 'COMP-';
  ELSIF counter_id = 'order' THEN
    prefix := 'ENC-';
  ELSE
    prefix := '';
  END IF;
  
  -- Verificar se contador existe para este ID e ano
  IF NOT EXISTS (SELECT 1 FROM public.counters WHERE id = counter_id AND year = target_year) THEN
    -- Inserir um novo contador para o ano específico
    INSERT INTO public.counters (id, year, current_count)
    VALUES (counter_id, target_year, 0);
  END IF;
  
  -- Incrementar contador e obter o novo valor
  UPDATE public.counters
  SET current_count = current_count + 1
  WHERE id = counter_id AND year = target_year
  RETURNING current_count INTO next_count;
  
  -- Formatar o número com zeros à esquerda (ex: 2024/001)
  formatted_number := prefix || target_year || '/' || LPAD(next_count::TEXT, 3, '0');
  
  RETURN formatted_number;
END;
$$;

-- Fix get_next_counter function
CREATE OR REPLACE FUNCTION public.get_next_counter(counter_id text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $$
DECLARE
  current_year INTEGER;
  next_count INTEGER;
  formatted_number TEXT;
  prefix TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Determine the prefix based on counter_id
  IF counter_id = 'order' THEN
    prefix := 'ENC';
  ELSIF counter_id = 'entry' THEN
    prefix := 'COMP';
  ELSIF counter_id = 'exit' THEN
    prefix := 'VEN';
  ELSE
    prefix := counter_id;
  END IF;
  
  -- Check if year has changed and create a new counter if needed
  IF NOT EXISTS (
    SELECT 1 FROM public.counters 
    WHERE id = counter_id AND year = current_year
  ) THEN
    -- Insert a new counter for the new year
    INSERT INTO public.counters (id, year, current_count)
    VALUES (counter_id, current_year, 0);
  END IF;
  
  -- Increment counter and get the new value
  UPDATE public.counters
  SET current_count = current_count + 1
  WHERE id = counter_id AND year = current_year
  RETURNING current_count INTO next_count;
  
  -- Format the counter with leading zeros (e.g., ENC-2025/001)
  formatted_number := prefix || '-' || current_year || '/' || LPAD(next_count::TEXT, 3, '0');
  
  RETURN formatted_number;
END;
$$;

-- Fix update_user_profiles_updated_at function
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_kpi_targets_updated_at function
CREATE OR REPLACE FUNCTION public.update_kpi_targets_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix is_admin function (legacy)
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check if user exists (we can enhance this later to use a profiles table with roles)
  RETURN auth.uid() IS NOT NULL;
END;
$$;