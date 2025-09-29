-- Corrigir preços da venda VEN-2025/021 que foi duplicada
-- A venda original VEN-2025/020 já foi corrigida, esta é a duplicata

UPDATE stock_exit_items sei
SET sale_price = oi.sale_price,
    discount_percent = COALESCE(oi.discount_percent, 0)
FROM order_items oi
WHERE sei.exit_id = 'c374d36f-54e9-4a05-b95f-07409f7627ee'
  AND oi.order_id = 'f338a196-00c8-469a-b32a-237bc9a716eb'
  AND sei.product_name = oi.product_name;