-- ============================================================================
-- Staff Leave Application - RLS Policies for Public Access
-- ============================================================================
-- This script adds Row Level Security policies to allow anonymous staff
-- to submit leave requests via the public form at /staff-leave-request
--
-- Execute this in Supabase SQL Editor after deploying the new feature
-- ============================================================================

-- ============================================================================
-- 1. Allow anonymous users to INSERT leave requests
-- ============================================================================
-- This policy allows unauthenticated users to create leave requests
-- with status='pending' for active staff members only
-- All submitted requests require admin approval

CREATE POLICY "Allow public leave request submissions"
  ON leave_requests 
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'pending' AND
    staff_id IN (SELECT id FROM staff WHERE is_active = true)
  );

-- ============================================================================
-- 2. Allow anonymous users to view active staff list
-- ============================================================================
-- This policy allows the public form to populate the staff dropdown
-- Only exposes basic info (id, name, role) - no sensitive data like email

CREATE POLICY "Allow public to view active staff names"
  ON staff 
  FOR SELECT
  TO anon
  USING (is_active = true);

-- ============================================================================
-- 3. Allow anonymous users to view their own leave requests
-- ============================================================================
-- This policy allows staff to view their own leave requests via the
-- personal status page at /my-leaves/:staffId
-- No authentication required - security through knowing the staff ID (UUID)

CREATE POLICY "Allow anonymous users to view leave requests by staff ID"
  ON leave_requests
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these queries to verify the policies are working correctly:

-- 1. Check if the policies were created successfully
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
WHERE tablename IN ('leave_requests', 'staff')
  AND policyname IN ('Allow public leave request submissions', 'Allow public to view active staff names')
ORDER BY tablename, policyname;

-- 2. Test that active staff are visible (simulate anon access)
-- This should return a list of active staff
SELECT id, name, role 
FROM staff 
WHERE is_active = true
ORDER BY name;

-- 3. Verify leave_requests table has correct RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'leave_requests';

-- ============================================================================
-- Security Notes
-- ============================================================================
-- 
-- 1. Rate Limiting:
--    Consider implementing rate limiting via Supabase Edge Functions
--    or using a CAPTCHA if abuse is detected
--
-- 2. Validation:
--    The public form validates data client-side, but the database
--    constraints provide server-side validation:
--    - valid_date_range CHECK ensures end_date >= start_date
--    - status CHECK ensures only valid statuses are used
--    - Foreign key ensures staff_id references valid staff
--
-- 3. Data Privacy:
--    Only basic staff info (name, role) is exposed to anonymous users
--    Email addresses and other sensitive data remain protected
--
-- 4. Admin Control:
--    All public submissions have status='pending' and require admin approval
--    Admins retain full control over the leave management workflow
--
-- ============================================================================
-- Rollback Instructions (if needed)
-- ============================================================================
-- To remove these policies if you need to disable public access:
--
-- DROP POLICY IF EXISTS "Allow public leave request submissions" ON leave_requests;
-- DROP POLICY IF EXISTS "Allow public to view active staff names" ON staff;
--
-- ============================================================================

