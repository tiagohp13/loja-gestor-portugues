-- Add total_spent and purchase_count to suppliers table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;

-- Create function to update supplier stats
CREATE OR REPLACE FUNCTION public.update_supplier_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affected_supplier_id UUID;
BEGIN
  -- Determine which supplier was affected
  IF TG_OP = 'DELETE' THEN
    affected_supplier_id := OLD.supplier_id;
  ELSE
    affected_supplier_id := NEW.supplier_id;
  END IF;

  -- Skip if no supplier is associated
  IF affected_supplier_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Update supplier statistics
  UPDATE suppliers
  SET 
    -- Calculate total spent from stock entries
    total_spent = COALESCE((
      SELECT SUM(
        COALESCE((
          SELECT SUM(sei.quantity * sei.purchase_price * (1 - COALESCE(sei.discount_percent, 0) / 100))
          FROM stock_entry_items sei
          WHERE sei.entry_id = se.id
        ), 0)
      )
      FROM stock_entries se
      WHERE se.supplier_id = affected_supplier_id
        AND se.deleted_at IS NULL
        AND se.status = 'active'
    ), 0) + COALESCE((
      -- Add expenses for this supplier
      SELECT SUM(
        COALESCE((
          SELECT SUM(ei.quantity * ei.unit_price * (1 - COALESCE(ei.discount_percent, 0) / 100))
          FROM expense_items ei
          WHERE ei.expense_id = e.id
        ), 0) * (1 - COALESCE(e.discount, 0) / 100)
      )
      FROM expenses e
      WHERE e.supplier_id = affected_supplier_id
        AND e.deleted_at IS NULL
        AND e.status = 'active'
    ), 0),
    -- Count purchases (stock entries)
    purchase_count = COALESCE((
      SELECT COUNT(*)
      FROM stock_entries se
      WHERE se.supplier_id = affected_supplier_id
        AND se.deleted_at IS NULL
        AND se.status = 'active'
    ), 0),
    updated_at = now()
  WHERE id = affected_supplier_id;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create triggers for stock_entries
DROP TRIGGER IF EXISTS trigger_update_supplier_stats_entries ON stock_entries;
CREATE TRIGGER trigger_update_supplier_stats_entries
  AFTER INSERT OR UPDATE OR DELETE ON stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_stats();

-- Create triggers for stock_entry_items
DROP TRIGGER IF EXISTS trigger_update_supplier_stats_entry_items ON stock_entry_items;
CREATE TRIGGER trigger_update_supplier_stats_entry_items
  AFTER INSERT OR UPDATE OR DELETE ON stock_entry_items
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_stats();

-- Create triggers for expenses
DROP TRIGGER IF EXISTS trigger_update_supplier_stats_expenses ON expenses;
CREATE TRIGGER trigger_update_supplier_stats_expenses
  AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_stats();

-- Create triggers for expense_items
DROP TRIGGER IF EXISTS trigger_update_supplier_stats_expense_items ON expense_items;
CREATE TRIGGER trigger_update_supplier_stats_expense_items
  AFTER INSERT OR UPDATE OR DELETE ON expense_items
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_stats();

-- Initialize total_spent and purchase_count for existing suppliers
UPDATE suppliers s
SET 
  total_spent = COALESCE((
    SELECT SUM(
      COALESCE((
        SELECT SUM(sei.quantity * sei.purchase_price * (1 - COALESCE(sei.discount_percent, 0) / 100))
        FROM stock_entry_items sei
        WHERE sei.entry_id = se.id
      ), 0)
    )
    FROM stock_entries se
    WHERE se.supplier_id = s.id
      AND se.deleted_at IS NULL
      AND se.status = 'active'
  ), 0) + COALESCE((
    SELECT SUM(
      COALESCE((
        SELECT SUM(ei.quantity * ei.unit_price * (1 - COALESCE(ei.discount_percent, 0) / 100))
        FROM expense_items ei
        WHERE ei.expense_id = e.id
      ), 0) * (1 - COALESCE(e.discount, 0) / 100)
    )
    FROM expenses e
    WHERE e.supplier_id = s.id
      AND e.deleted_at IS NULL
      AND e.status = 'active'
  ), 0),
  purchase_count = COALESCE((
    SELECT COUNT(*)
    FROM stock_entries se
    WHERE se.supplier_id = s.id
      AND se.deleted_at IS NULL
      AND se.status = 'active'
  ), 0),
  updated_at = now()
WHERE s.deleted_at IS NULL;