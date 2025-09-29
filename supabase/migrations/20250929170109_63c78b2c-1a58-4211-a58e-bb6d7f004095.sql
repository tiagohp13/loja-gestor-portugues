-- Update duplicate_order function to preserve original date and allow full editability
CREATE OR REPLACE FUNCTION public.duplicate_order(order_id_to_duplicate uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_order_id uuid;
  original_order RECORD;
  order_item RECORD;
BEGIN
  -- Verificar se o utilizador tem acesso à encomenda original
  SELECT * INTO original_order 
  FROM public.orders 
  WHERE id = order_id_to_duplicate 
  AND (user_id = auth.uid() OR auth.uid() IN (
    SELECT user_id FROM public.user_profiles WHERE access_level = 'admin'
  ));
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Encomenda não encontrada ou sem permissão de acesso';
  END IF;
  
  -- Criar nova encomenda mantendo a data original
  INSERT INTO public.orders (
    client_id,
    client_name,
    date,
    notes,
    discount,
    user_id,
    number
  ) VALUES (
    original_order.client_id,
    original_order.client_name,
    original_order.date, -- Manter data original em vez de now()
    'Duplicada de ' || original_order.number,
    original_order.discount,
    auth.uid(),
    public.get_next_counter('order')
  ) RETURNING id INTO new_order_id;
  
  -- Copiar itens da encomenda
  FOR order_item IN 
    SELECT * FROM public.order_items 
    WHERE order_id = order_id_to_duplicate
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      sale_price,
      discount_percent
    ) VALUES (
      new_order_id,
      order_item.product_id,
      order_item.product_name,
      order_item.quantity,
      order_item.sale_price,
      order_item.discount_percent
    );
  END LOOP;
  
  RETURN new_order_id;
END;
$function$;