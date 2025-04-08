
-- Enable realtime for products
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- Enable realtime for categories
ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;

-- Enable realtime for stock_entries
ALTER TABLE public.stock_entries REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_entries;

-- Enable realtime for stock_entry_items
ALTER TABLE public.stock_entry_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_entry_items;

-- Enable realtime for stock_exits
ALTER TABLE public.stock_exits REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_exits;

-- Enable realtime for stock_exit_items
ALTER TABLE public.stock_exit_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_exit_items;

-- Enable realtime for orders
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable realtime for order_items
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

