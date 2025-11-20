-- Corrigir compra com prefixo errado ENT → COMP
UPDATE stock_entries 
SET number = 'COMP-2025/017'
WHERE number = 'ENT-2025/001';