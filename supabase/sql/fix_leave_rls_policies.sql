-- Fix Row Level Security Policies for Leave Requests
-- This ensures authenticated users can update leave requests

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "Authenticated users can access all data" ON public.leave_requests;
DROP POLICY IF EXISTS "Admins full on leave_requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Staff create own leave" ON public.leave_requests;
DROP POLICY IF EXISTS "Staff view own leave" ON public.leave_requests;

-- Ensure RLS is enabled
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Create a comprehensive policy that allows all operations for authenticated users
CREATE POLICY "Authenticated users full access to leave_requests"
  ON public.leave_requests 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'leave_requests'
ORDER BY policyname;

-- Test the policy by checking if we can select from leave_requests
-- This should return all leave requests for authenticated users
SELECT COUNT(*) as leave_requests_count FROM public.leave_requests;
