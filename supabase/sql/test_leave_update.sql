-- Test script to diagnose leave request update issues
-- Run this in Supabase SQL Editor to check permissions

-- 1. Check if the leave request exists
SELECT 
  id,
  staff_id,
  status,
  approved_by,
  approved_at,
  created_at
FROM public.leave_requests 
WHERE id = 'c2f4e6e4-f096-4e92-9955-5294f38e36b0';

-- 2. Check current user context
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 3. Check if current user is in admin_users table
SELECT 
  id,
  email,
  name,
  is_super_admin
FROM public.admin_users 
WHERE id = auth.uid();

-- 4. Test a simple update (this should work if RLS is configured correctly)
-- Replace 'c2f4e6e4-f096-4e92-9955-5294f38e36b0' with an actual leave request ID
UPDATE public.leave_requests 
SET notes = 'Test update from SQL'
WHERE id = 'c2f4e6e4-f096-4e92-9955-5294f38e36b0'
RETURNING id, status, notes;

-- 5. Check RLS policies on leave_requests table
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'leave_requests';
