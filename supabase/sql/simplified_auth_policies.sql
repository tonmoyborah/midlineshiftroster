-- Simplified Authentication Policies
-- This replaces complex role-based policies with simple authenticated access
-- All authenticated users have the same permissions

-- =============================
-- Remove Existing Complex Policies
-- =============================

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins full on clinics" ON public.clinics;
DROP POLICY IF EXISTS "Admins full on staff" ON public.staff;
DROP POLICY IF EXISTS "Admins full on staff_working_days" ON public.staff_working_days;
DROP POLICY IF EXISTS "Admins full on leave_requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Admins full on shift_assignments" ON public.shift_assignments;
DROP POLICY IF EXISTS "Admins full on unapproved_absences" ON public.unapproved_absences;
DROP POLICY IF EXISTS "Admins read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Staff view self" ON public.staff;
DROP POLICY IF EXISTS "Staff create own leave" ON public.leave_requests;
DROP POLICY IF EXISTS "Staff view own leave" ON public.leave_requests;
DROP POLICY IF EXISTS "Public read clinics" ON public.clinics;
DROP POLICY IF EXISTS "Public read staff" ON public.staff;
DROP POLICY IF EXISTS "Public read shift_assignments" ON public.shift_assignments;
DROP POLICY IF EXISTS "Public read leave_requests" ON public.leave_requests;

-- =============================
-- Create Simplified Policies
-- =============================

-- All authenticated users can access all data
CREATE POLICY "Authenticated users can access all data"
  ON public.clinics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access all data"
  ON public.staff FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access all data"
  ON public.staff_working_days FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access all data"
  ON public.leave_requests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access all data"
  ON public.shift_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access all data"
  ON public.unapproved_absences FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin users table - only authenticated users can read (for future use)
CREATE POLICY "Authenticated users can read admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (true);

-- =============================
-- Verify Policies
-- =============================

-- Check that all tables have policies
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
ORDER BY tablename, policyname;
