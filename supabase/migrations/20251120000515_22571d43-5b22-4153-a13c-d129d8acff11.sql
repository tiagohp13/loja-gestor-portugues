-- Eliminar a entrada incorreta ENT-2025/017
DELETE FROM stock_entry_items WHERE entry_id = '760e8d8b-8570-4849-9d91-667f05ea4fde';
DELETE FROM stock_entries WHERE id = '760e8d8b-8570-4849-9d91-667f05ea4fde';

-- Atualizar o stock do produto Guppy Endler Macho para 0
UPDATE products 
SET current_stock = 0 
WHERE id = 'baf804c8-bcdb-45f4-9388-1994fa56e5d5';

-- Atualizar todos os números de compras existentes que usam ENT- para COMP-
UPDATE stock_entries 
SET number = REPLACE(number, 'ENT-', 'COMP-')
WHERE number LIKE 'ENT-%';

-- Atualizar o counter_type de stock_entries para COMP
UPDATE counters 
SET counter_type = 'COMP'
WHERE counter_type = 'stock_entries';