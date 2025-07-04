-- Create function to get user access level (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_access_level(user_id uuid DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT access_level 
    FROM public.user_profiles 
    WHERE user_profiles.user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to check if user is admin or editor
CREATE OR REPLACE FUNCTION public.can_write_data(user_id uuid DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_access_level($1) IN ('admin', 'editor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to check if user is admin (can delete)
CREATE OR REPLACE FUNCTION public.can_delete_data(user_id uuid DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_access_level($1) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Apply RLS policies to products table
CREATE POLICY "Users can view products" 
ON public.products 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and editor can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (public.can_write_data());

CREATE POLICY "Admin and editor can update products" 
ON public.products 
FOR UPDATE 
USING (public.can_write_data());

CREATE POLICY "Only admin can delete products" 
ON public.products 
FOR DELETE 
USING (public.can_delete_data());

-- Apply RLS policies to clients table
CREATE POLICY "Users can view clients" 
ON public.clients 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and editor can insert clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (public.can_write_data());

CREATE POLICY "Admin and editor can update clients" 
ON public.clients 
FOR UPDATE 
USING (public.can_write_data());

CREATE POLICY "Only admin can delete clients" 
ON public.clients 
FOR DELETE 
USING (public.can_delete_data());

-- Apply RLS policies to suppliers table
CREATE POLICY "Users can view suppliers" 
ON public.suppliers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and editor can insert suppliers" 
ON public.suppliers 
FOR INSERT 
WITH CHECK (public.can_write_data());

CREATE POLICY "Admin and editor can update suppliers" 
ON public.suppliers 
FOR UPDATE 
USING (public.can_write_data());

CREATE POLICY "Only admin can delete suppliers" 
ON public.suppliers 
FOR DELETE 
USING (public.can_delete_data());

-- Apply RLS policies to orders table
CREATE POLICY "Users can view orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and editor can insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (public.can_write_data());

CREATE POLICY "Admin and editor can update orders" 
ON public.orders 
FOR UPDATE 
USING (public.can_write_data());

CREATE POLICY "Only admin can delete orders" 
ON public.orders 
FOR DELETE 
USING (public.can_delete_data());

-- Apply RLS policies to stock_entries table
CREATE POLICY "Users can view stock_entries" 
ON public.stock_entries 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and editor can insert stock_entries" 
ON public.stock_entries 
FOR INSERT 
WITH CHECK (public.can_write_data());

CREATE POLICY "Admin and editor can update stock_entries" 
ON public.stock_entries 
FOR UPDATE 
USING (public.can_write_data());

CREATE POLICY "Only admin can delete stock_entries" 
ON public.stock_entries 
FOR DELETE 
USING (public.can_delete_data());

-- Apply RLS policies to stock_exits table
CREATE POLICY "Users can view stock_exits" 
ON public.stock_exits 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and editor can insert stock_exits" 
ON public.stock_exits 
FOR INSERT 
WITH CHECK (public.can_write_data());

CREATE POLICY "Admin and editor can update stock_exits" 
ON public.stock_exits 
FOR UPDATE 
USING (public.can_write_data());

CREATE POLICY "Only admin can delete stock_exits" 
ON public.stock_exits 
FOR DELETE 
USING (public.can_delete_data());

-- Apply RLS policies to expenses table
CREATE POLICY "Users can view expenses" 
ON public.expenses 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and editor can insert expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (public.can_write_data());

CREATE POLICY "Admin and editor can update expenses" 
ON public.expenses 
FOR UPDATE 
USING (public.can_write_data());

CREATE POLICY "Only admin can delete expenses" 
ON public.expenses 
FOR DELETE 
USING (public.can_delete_data());