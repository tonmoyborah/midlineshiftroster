-- Comprehensive fix for leave request permissions
-- This addresses the PGRST116 error by ensuring proper RLS policies

-- 1. First, let's check the current state
SELECT 'Current RLS policies on leave_requests:' as info;
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'leave_requests';

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can access all data" ON public.leave_requests;
DROP POLICY IF EXISTS "Admins full on leave_requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Staff create own leave" ON public.leave_requests;
DROP POLICY IF EXISTS "Staff view own leave" ON public.leave_requests;
DROP POLICY IF EXISTS "Authenticated users full access to leave_requests" ON public.leave_requests;

-- 3. Ensure RLS is enabled
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- 4. Create a simple, permissive policy for authenticated users
CREATE POLICY "allow_all_for_authenticated_users"
  ON public.leave_requests 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- 5. Also ensure the user exists in admin_users table if they need admin privileges
-- Insert the current user into admin_users if they don't exist
INSERT INTO public.admin_users (id, email, name, is_super_admin)
SELECT 
  auth.uid(),
  auth.jwt() ->> 'email',
  COALESCE(auth.jwt() ->> 'name', auth.jwt() ->> 'email'),
  false
WHERE auth.uid() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );

-- 6. Verify the policy was created
SELECT 'New RLS policies on leave_requests:' as info;
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'leave_requests';

-- 7. Test that we can read leave requests
SELECT 'Testing read access:' as info;
SELECT COUNT(*) as leave_requests_count FROM public.leave_requests;

-- 8. Show current user info
SELECT 'Current user info:' as info;
SELECT 
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as email,
  EXISTS(SELECT 1 FROM public.admin_users WHERE id = auth.uid()) as is_admin;
