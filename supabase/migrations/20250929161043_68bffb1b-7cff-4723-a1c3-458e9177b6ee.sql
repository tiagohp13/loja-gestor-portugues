-- CORREÇÃO: REMOVER FOREIGN KEYS DUPLICADAS

-- Remover as foreign keys que criei (mantendo as originais)
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS fk_order_items_order_id;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS fk_order_items_product_id;

ALTER TABLE stock_entry_items DROP CONSTRAINT IF EXISTS fk_stock_entry_items_entry_id;
ALTER TABLE stock_entry_items DROP CONSTRAINT IF EXISTS fk_stock_entry_items_product_id;

ALTER TABLE stock_exit_items DROP CONSTRAINT IF EXISTS fk_stock_exit_items_exit_id;
ALTER TABLE stock_exit_items DROP CONSTRAINT IF EXISTS fk_stock_exit_items_product_id;

ALTER TABLE expense_items DROP CONSTRAINT IF EXISTS fk_expense_items_expense_id;