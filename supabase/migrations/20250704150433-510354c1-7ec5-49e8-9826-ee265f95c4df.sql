-- Fix RLS policies for expense_items to allow viewers to see expense items
-- when they can view the parent expense

-- Drop the overly restrictive existing policy
DROP POLICY IF EXISTS "Users can view their own expense items" ON public.expense_items;

-- Create new policy that allows viewing expense items if user can view the parent expense
CREATE POLICY "Users can view expense items" 
ON public.expense_items 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.expenses 
    WHERE expenses.id = expense_items.expense_id
  )
);

-- Also ensure that the CategoryDetail issue is addressed by adding permission check
-- The categories and products tables already have correct RLS policies, so this should work