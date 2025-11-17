-- Remove the old unique constraint on products.code
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_code_unique;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_code_key;

-- Create a partial unique index that only applies to non-deleted products
-- This allows reusing codes after soft delete
CREATE UNIQUE INDEX products_code_active_unique 
ON products (code) 
WHERE deleted_at IS NULL;

-- Add comment explaining the constraint
COMMENT ON INDEX products_code_active_unique IS 'Ensures code uniqueness only for active (non-deleted) products, allowing code reuse after deletion';