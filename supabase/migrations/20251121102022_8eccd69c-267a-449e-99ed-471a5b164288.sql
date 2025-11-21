-- Function to update category product count
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
DECLARE
  old_category TEXT;
  new_category TEXT;
BEGIN
  -- Get old and new category names
  IF TG_OP = 'DELETE' THEN
    old_category := OLD.category;
  ELSIF TG_OP = 'UPDATE' THEN
    old_category := OLD.category;
    new_category := NEW.category;
  ELSIF TG_OP = 'INSERT' THEN
    new_category := NEW.category;
  END IF;

  -- Update count for old category (DELETE or UPDATE changing category)
  IF old_category IS NOT NULL THEN
    UPDATE categories
    SET product_count = (
      SELECT COUNT(*)
      FROM products
      WHERE products.category = old_category
        AND products.deleted_at IS NULL
    ),
    updated_at = now()
    WHERE categories.name = old_category
      AND categories.deleted_at IS NULL;
  END IF;

  -- Update count for new category (INSERT or UPDATE changing category)
  IF new_category IS NOT NULL THEN
    UPDATE categories
    SET product_count = (
      SELECT COUNT(*)
      FROM products
      WHERE products.category = new_category
        AND products.deleted_at IS NULL
    ),
    updated_at = now()
    WHERE categories.name = new_category
      AND categories.deleted_at IS NULL;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for INSERT
DROP TRIGGER IF EXISTS trigger_update_category_count_insert ON products;
CREATE TRIGGER trigger_update_category_count_insert
AFTER INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION update_category_product_count();

-- Create trigger for UPDATE
DROP TRIGGER IF EXISTS trigger_update_category_count_update ON products;
CREATE TRIGGER trigger_update_category_count_update
AFTER UPDATE ON products
FOR EACH ROW
WHEN (OLD.category IS DISTINCT FROM NEW.category OR OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
EXECUTE FUNCTION update_category_product_count();

-- Create trigger for DELETE (soft delete)
DROP TRIGGER IF EXISTS trigger_update_category_count_delete ON products;
CREATE TRIGGER trigger_update_category_count_delete
AFTER UPDATE ON products
FOR EACH ROW
WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
EXECUTE FUNCTION update_category_product_count();

-- Initialize product counts for existing categories
UPDATE categories
SET product_count = (
  SELECT COUNT(*)
  FROM products
  WHERE products.category = categories.name
    AND products.deleted_at IS NULL
)
WHERE categories.deleted_at IS NULL;