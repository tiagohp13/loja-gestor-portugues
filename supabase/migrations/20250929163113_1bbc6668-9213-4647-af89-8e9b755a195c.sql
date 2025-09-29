-- Implementar funcionalidades: Histórico de preços, Última compra do cliente, Duplicar encomenda

-- 1. Criar tabela para histórico de preços dos produtos
CREATE TABLE public.product_price_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  change_date timestamp with time zone NOT NULL DEFAULT now(),
  old_sale_price numeric,
  new_sale_price numeric,
  old_purchase_price numeric,
  new_purchase_price numeric,
  change_reason text DEFAULT 'manual_update',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_product_price_history_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Habilitar RLS na tabela de histórico de preços
ALTER TABLE public.product_price_history ENABLE ROW LEVEL SECURITY;

-- Políticas para histórico de preços
CREATE POLICY "price_history_select_own_data" 
ON public.product_price_history 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "price_history_insert_own_data" 
ON public.product_price_history 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Adicionar campo "última compra" na tabela de clientes
ALTER TABLE public.clients 
ADD COLUMN last_purchase_date timestamp with time zone;

-- 3. Criar função para registar mudanças de preços
CREATE OR REPLACE FUNCTION public.log_product_price_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Apenas registar se houve mudança nos preços
  IF (OLD.sale_price IS DISTINCT FROM NEW.sale_price) OR 
     (OLD.purchase_price IS DISTINCT FROM NEW.purchase_price) THEN
    
    INSERT INTO public.product_price_history (
      product_id,
      user_id,
      old_sale_price,
      new_sale_price,
      old_purchase_price,
      new_purchase_price,
      change_reason
    ) VALUES (
      NEW.id,
      NEW.user_id,
      OLD.sale_price,
      NEW.sale_price,
      OLD.purchase_price,
      NEW.purchase_price,
      'product_update'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para capturar mudanças de preços
CREATE TRIGGER product_price_change_trigger
  AFTER UPDATE ON public.products
  FOR EACH ROW 
  EXECUTE FUNCTION public.log_product_price_change();

-- 4. Criar função para atualizar última compra do cliente
CREATE OR REPLACE FUNCTION public.update_client_last_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar a data da última compra do cliente
  IF NEW.client_id IS NOT NULL THEN
    UPDATE public.clients 
    SET last_purchase_date = NEW.date
    WHERE id = NEW.client_id
    AND (last_purchase_date IS NULL OR last_purchase_date < NEW.date);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar triggers para atualizar última compra
CREATE TRIGGER update_client_last_purchase_on_order
  AFTER INSERT ON public.orders
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_client_last_purchase();

CREATE TRIGGER update_client_last_purchase_on_stock_exit
  AFTER INSERT ON public.stock_exits
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_client_last_purchase();

-- 5. Criar função para duplicar encomenda
CREATE OR REPLACE FUNCTION public.duplicate_order(order_id_to_duplicate uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  
  -- Criar nova encomenda
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
    now(), -- Nova data
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
$$;

-- Criar índices para melhor performance
CREATE INDEX idx_product_price_history_product_id ON public.product_price_history(product_id);
CREATE INDEX idx_product_price_history_change_date ON public.product_price_history(change_date DESC);
CREATE INDEX idx_clients_last_purchase_date ON public.clients(last_purchase_date DESC NULLS LAST);

-- Log de segurança
SELECT public.log_security_event(
  'FEATURE_IMPLEMENTATION', 
  'Implementadas funcionalidades: histórico de preços, última compra e duplicar encomenda', 
  'multiple_tables', 
  NULL
);