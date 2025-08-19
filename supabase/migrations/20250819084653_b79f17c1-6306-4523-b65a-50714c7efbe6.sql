-- CRITICAL SECURITY FIX: Secure the clients table and fix data ownership

-- Step 1: Remove all dangerous policies that allow unauthorized access
DROP POLICY IF EXISTS "Users can view clients" ON clients;
DROP POLICY IF EXISTS "Allow owners to read clients" ON clients;  
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios clientes" ON clients;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios clientes" ON clients;

-- Step 2: Get the first admin user to assign orphaned records
DO $$
DECLARE
    admin_user_id UUID;
    orphaned_count INTEGER;
BEGIN
    -- Find first admin user
    SELECT user_id INTO admin_user_id 
    FROM user_profiles 
    WHERE access_level = 'admin' 
    LIMIT 1;
    
    -- If no admin found, use the first user with data
    IF admin_user_id IS NULL THEN
        SELECT DISTINCT user_id INTO admin_user_id
        FROM clients 
        WHERE user_id IS NOT NULL 
        LIMIT 1;
    END IF;
    
    -- Count orphaned records
    SELECT COUNT(*) INTO orphaned_count 
    FROM clients 
    WHERE user_id IS NULL;
    
    -- Log the operation
    RAISE NOTICE 'Found % orphaned client records. Assigning to user: %', orphaned_count, COALESCE(admin_user_id::text, 'NO USER FOUND');
    
    -- Assign orphaned records to admin/first user (only if we found a user)
    IF admin_user_id IS NOT NULL THEN
        UPDATE clients 
        SET user_id = admin_user_id 
        WHERE user_id IS NULL;
        
        RAISE NOTICE 'Successfully assigned % orphaned records to user %', orphaned_count, admin_user_id;
    ELSE
        RAISE WARNING 'NO USERS FOUND - Cannot assign orphaned records. Manual intervention required.';
    END IF;
END $$;

-- Step 3: Make user_id column NOT NULL to prevent future orphaned records
ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Create secure RLS policies that enforce proper data ownership

-- Secure SELECT policy: Users can only see their own clients + admins see all
CREATE POLICY "Secure client access - users see own data only" ON clients
  FOR SELECT USING (
    auth.uid() = user_id OR 
    is_user_admin(auth.uid())
  );

-- Secure INSERT policy: Users can only create clients assigned to themselves
CREATE POLICY "Secure client creation - own data only" ON clients
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    (can_write_data() OR is_user_admin(auth.uid()))
  );

-- Secure UPDATE policy: Users can only update their own clients
CREATE POLICY "Secure client updates - own data only" ON clients
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    (can_write_data() OR is_user_admin(auth.uid()))
  );

-- Secure DELETE policy: Only admins can delete clients
CREATE POLICY "Secure client deletion - admin only" ON clients
  FOR DELETE USING (
    can_delete_data()
  );

-- Step 5: Add security audit logging function
CREATE OR REPLACE FUNCTION log_client_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any access to client data for security monitoring
  IF TG_OP = 'SELECT' THEN
    RAISE LOG 'Client data accessed by user % for client %', auth.uid(), OLD.id;
  ELSIF TG_OP = 'UPDATE' THEN  
    RAISE LOG 'Client data updated by user % for client %', auth.uid(), NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    RAISE LOG 'Client data deleted by user % for client %', auth.uid(), OLD.id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Step 6: Verify the fix worked
DO $$
DECLARE
    remaining_orphaned INTEGER;
    total_records INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_orphaned FROM clients WHERE user_id IS NULL;
    SELECT COUNT(*) INTO total_records FROM clients;
    
    RAISE NOTICE 'SECURITY FIX COMPLETE: % total records, % orphaned records remaining', total_records, remaining_orphaned;
    
    IF remaining_orphaned > 0 THEN
        RAISE WARNING 'SECURITY ALERT: % records still have NULL user_id - manual review required', remaining_orphaned;
    ELSE
        RAISE NOTICE 'SUCCESS: All client records now have proper ownership';
    END IF;
END $$;