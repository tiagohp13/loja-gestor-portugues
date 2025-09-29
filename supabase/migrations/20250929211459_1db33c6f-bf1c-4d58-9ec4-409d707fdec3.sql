-- Corrigir preços da venda VEN-2025/020 para corresponder à encomenda ENC-2025/023
-- Esta venda foi convertida da encomenda mas tem preços diferentes

-- Atualizar os itens da venda para terem os mesmos preços da encomenda
UPDATE stock_exit_items sei
SET sale_price = oi.sale_price,
    discount_percent = oi.discount_percent
FROM order_items oi
WHERE sei.exit_id = '15bfdaf3-b626-46c5-a867-397f5a181088'
  AND oi.order_id = 'f338a196-00c8-469a-b32a-237bc9a716eb'
  AND sei.product_name = oi.product_name;