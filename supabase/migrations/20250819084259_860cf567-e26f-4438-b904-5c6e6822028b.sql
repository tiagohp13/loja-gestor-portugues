-- Fix remaining function security issues by setting proper search_path

-- Update all remaining functions to have secure search_path settings
CREATE OR REPLACE FUNCTION public.get_next_counter_by_year(counter_id text, target_year integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_padded_sequence(items json, prefix text DEFAULT ''::text)
RETURNS TABLE(id text, new_number text)
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, access_level)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_kpi_targets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.table_exists(schema_name text, table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = schema_name
          AND table_name = table_exists.table_name
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = table_exists.table_name
    );
END;
$function$;