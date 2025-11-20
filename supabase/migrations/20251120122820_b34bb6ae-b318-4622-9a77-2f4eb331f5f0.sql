-- Clean up incorrect counter_type entries
-- Remove old prefixes that were mistakenly used as counter_type
DELETE FROM counters 
WHERE counter_type IN ('COMP', 'order', 'VEND', 'ENC', 'DESP', 'REQ');

-- Ensure correct counters exist for 2025
INSERT INTO counters (counter_type, year, current_count, last_number)
VALUES 
  ('stock_entries', 2025, 20, 20),
  ('stock_exits', 2025, 37, 37),
  ('orders', 2025, 31, 31),
  ('expenses', 2025, 14, 14),
  ('requisicoes', 2025, 7, 7)
ON CONFLICT (counter_type, year) 
DO UPDATE SET 
  current_count = EXCLUDED.current_count,
  last_number = EXCLUDED.last_number,
  updated_at = now();