-- Fix existing products without status
UPDATE products SET status = 'active' WHERE status IS NULL;

-- Fix existing categories without status  
UPDATE categories SET status = 'active' WHERE status IS NULL;

-- Fix existing clients without status
UPDATE clients SET status = 'active' WHERE status IS NULL;

-- Fix existing suppliers without status
UPDATE suppliers SET status = 'active' WHERE status IS NULL;

-- Fix existing orders without status
UPDATE orders SET status = 'active' WHERE status IS NULL;

-- Fix existing stock_entries without status
UPDATE stock_entries SET status = 'active' WHERE status IS NULL;

-- Fix existing stock_exits without status
UPDATE stock_exits SET status = 'active' WHERE status IS NULL;

-- Fix existing expenses without status
UPDATE expenses SET status = 'active' WHERE status IS NULL;