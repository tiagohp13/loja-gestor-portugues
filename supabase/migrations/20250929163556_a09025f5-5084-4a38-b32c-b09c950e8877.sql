-- Atualizar a última compra dos clientes existentes baseado nas encomendas e saídas de stock

-- Atualizar baseado nas encomendas (orders)
UPDATE public.clients 
SET last_purchase_date = (
  SELECT MAX(o.date) 
  FROM public.orders o 
  WHERE o.client_id = clients.id
)
WHERE EXISTS (
  SELECT 1 FROM public.orders o 
  WHERE o.client_id = clients.id
);

-- Atualizar baseado nas saídas de stock (stock_exits) se for mais recente
UPDATE public.clients 
SET last_purchase_date = (
  SELECT MAX(se.date) 
  FROM public.stock_exits se 
  WHERE se.client_id = clients.id
)
WHERE EXISTS (
  SELECT 1 FROM public.stock_exits se 
  WHERE se.client_id = clients.id
  AND se.date > COALESCE(clients.last_purchase_date, '1900-01-01'::timestamp)
);

-- Log da atualização
SELECT public.log_security_event(
  'DATA_UPDATE', 
  'Atualizadas datas de última compra dos clientes existentes', 
  'clients', 
  NULL
);