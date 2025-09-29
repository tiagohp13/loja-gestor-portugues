-- Add unique constraint to product code to prevent duplicates
ALTER TABLE products ADD CONSTRAINT products_code_unique UNIQUE (code);