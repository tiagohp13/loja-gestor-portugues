-- Add computed fields to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;

-- Function to update client statistics
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
DECLARE
  affected_client_id UUID;
BEGIN
  -- Determine which client was affected
  IF TG_OP = 'DELETE' THEN
    affected_client_id := OLD.client_id;
  ELSE
    affected_client_id := NEW.client_id;
  END IF;

  -- Skip if no client is associated
  IF affected_client_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Update client statistics
  UPDATE clients
  SET 
    total_spent = COALESCE((
      SELECT SUM(
        COALESCE((
          SELECT SUM(sei.quantity * sei.sale_price * (1 - COALESCE(sei.discount_percent, 0) / 100))
          FROM stock_exit_items sei
          WHERE sei.exit_id = se.id
        ), 0) * (1 - COALESCE(se.discount, 0) / 100)
      )
      FROM stock_exits se
      WHERE se.client_id = affected_client_id
        AND se.deleted_at IS NULL
        AND se.status = 'active'
    ), 0),
    purchase_count = COALESCE((
      SELECT COUNT(*)
      FROM stock_exits se
      WHERE se.client_id = affected_client_id
        AND se.deleted_at IS NULL
        AND se.status = 'active'
    ), 0),
    last_purchase_date = (
      SELECT MAX(se.date)
      FROM stock_exits se
      WHERE se.client_id = affected_client_id
        AND se.deleted_at IS NULL
        AND se.status = 'active'
    ),
    updated_at = now()
  WHERE id = affected_client_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for stock_exits changes
DROP TRIGGER IF EXISTS trigger_update_client_stats_exits ON stock_exits;
CREATE TRIGGER trigger_update_client_stats_exits
AFTER INSERT OR UPDATE OR DELETE ON stock_exits
FOR EACH ROW
EXECUTE FUNCTION update_client_stats();

-- Trigger for stock_exit_items changes
DROP TRIGGER IF EXISTS trigger_update_client_stats_items ON stock_exit_items;
CREATE TRIGGER trigger_update_client_stats_items
AFTER INSERT OR UPDATE OR DELETE ON stock_exit_items
FOR EACH ROW
EXECUTE FUNCTION update_client_stats();

-- Initialize statistics for existing clients
UPDATE clients
SET 
  total_spent = COALESCE((
    SELECT SUM(
      COALESCE((
        SELECT SUM(sei.quantity * sei.sale_price * (1 - COALESCE(sei.discount_percent, 0) / 100))
        FROM stock_exit_items sei
        WHERE sei.exit_id = se.id
      ), 0) * (1 - COALESCE(se.discount, 0) / 100)
    )
    FROM stock_exits se
    WHERE se.client_id = clients.id
      AND se.deleted_at IS NULL
      AND se.status = 'active'
  ), 0),
  purchase_count = COALESCE((
    SELECT COUNT(*)
    FROM stock_exits se
    WHERE se.client_id = clients.id
      AND se.deleted_at IS NULL
      AND se.status = 'active'
  ), 0),
  last_purchase_date = (
    SELECT MAX(se.date)
    FROM stock_exits se
    WHERE se.client_id = clients.id
      AND se.deleted_at IS NULL
      AND se.status = 'active'
  )
WHERE deleted_at IS NULL;