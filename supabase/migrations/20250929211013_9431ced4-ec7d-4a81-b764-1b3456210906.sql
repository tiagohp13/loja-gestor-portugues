-- Restore order ENC-2025/023 to pending state after its converted sale was deleted
UPDATE orders
SET 
  converted_to_stock_exit_id = NULL,
  converted_to_stock_exit_number = NULL
WHERE id = 'f338a196-00c8-469a-b32a-237bc9a716eb';