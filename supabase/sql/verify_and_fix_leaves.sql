-- ===================================================================
-- Verify and Fix Leave Request Dates
-- ===================================================================
-- This script will:
-- 1. Show current leave requests in your database
-- 2. Delete incorrect leave requests
-- 3. Insert correct leave requests
-- ===================================================================

-- STEP 1: Check current leave requests
-- Run this first to see what's currently in your database
SELECT 
  lr.id,
  s.name as staff_name,
  s.email,
  lr.start_date,
  lr.end_date,
  lr.status,
  lr.reason,
  lr.notes,
  -- Calculate number of days (inclusive)
  (lr.end_date - lr.start_date + 1) as days_of_leave
FROM leave_requests lr
JOIN staff s ON lr.staff_id = s.id
ORDER BY lr.start_date;

-- ===================================================================
-- Expected Results:
-- ===================================================================
-- Lisa Brown: 
--   start_date: 2025-10-02
--   end_date:   2025-10-03
--   days: 2 (Oct 2 and Oct 3)
--   status: approved
--
-- Dr. Rachel Kim:
--   start_date: 2025-09-30
--   end_date:   2025-10-01
--   days: 2 (Sept 30 and Oct 1)
--   status: approved
--
-- Maya Patel:
--   start_date: 2025-10-05
--   end_date:   2025-10-06
--   days: 2 (Oct 5 and Oct 6)
--   status: pending
-- ===================================================================

-- STEP 2: If dates are wrong, run this to reset them
-- WARNING: This will delete ALL leave requests and recreate the initial 3

DO $$
DECLARE
  lisa_id UUID;
  rachel_id UUID;
  maya_id UUID;
BEGIN
  -- Get staff IDs
  SELECT id INTO lisa_id FROM public.staff WHERE email = 'lisa.brown@clinic.com';
  SELECT id INTO rachel_id FROM public.staff WHERE email = 'rachel.kim@clinic.com';
  SELECT id INTO maya_id FROM public.staff WHERE email = 'maya.patel@clinic.com';
  
  -- Delete ALL existing leave requests
  DELETE FROM public.leave_requests;
  
  -- Insert CORRECT leave requests
  INSERT INTO public.leave_requests (staff_id, start_date, end_date, leave_type, reason, status, notes) VALUES
    -- Lisa Brown: Oct 2-3, 2025 (INCLUSIVE - both days)
    (lisa_id, '2025-10-02', '2025-10-03', 'planned', 'Family event', 'approved', 'Approved by manager'),
    
    -- Dr. Rachel Kim: Sept 30 - Oct 1, 2025 (INCLUSIVE - both days)
    (rachel_id, '2025-09-30', '2025-10-01', 'planned', 'Medical appointment', 'approved', 'Approved - arranged coverage'),
    
    -- Maya Patel: Oct 5-6, 2025 (INCLUSIVE - both days)
    (maya_id, '2025-10-05', '2025-10-06', 'planned', 'Personal day', 'pending', null);
  
  RAISE NOTICE '✅ Leave requests have been reset to correct dates!';
END $$;

-- STEP 3: Verify the fix worked
-- Run this after Step 2 to confirm dates are correct
SELECT 
  s.name as staff_name,
  TO_CHAR(lr.start_date, 'Mon DD, YYYY') as start_date,
  TO_CHAR(lr.end_date, 'Mon DD, YYYY') as end_date,
  (lr.end_date - lr.start_date + 1) as days,
  lr.status,
  lr.reason
FROM leave_requests lr
JOIN staff s ON lr.staff_id = s.id
ORDER BY lr.start_date;

-- ===================================================================
-- EXPECTED OUTPUT after fix:
-- ===================================================================
--  staff_name      | start_date    | end_date      | days | status   | reason
-- -----------------+---------------+---------------+------+----------+--------------------
--  Dr. Rachel Kim  | Sep 30, 2025  | Oct 01, 2025  |  2   | approved | Medical appointment
--  Lisa Brown      | Oct 02, 2025  | Oct 03, 2025  |  2   | approved | Family event
--  Maya Patel      | Oct 05, 2025  | Oct 06, 2025  |  2   | pending  | Personal day
-- ===================================================================

-- STEP 4: Test leave status on specific dates
-- This shows which staff will be "on leave" for each date
SELECT 
  '2025-10-02'::date as check_date,
  s.name,
  s.role,
  lr.start_date,
  lr.end_date,
  CASE 
    WHEN '2025-10-02'::date BETWEEN lr.start_date AND lr.end_date THEN 'ON LEAVE'
    ELSE 'NOT ON LEAVE'
  END as status_on_oct_2
FROM staff s
LEFT JOIN leave_requests lr ON s.id = lr.staff_id AND lr.status = 'approved'
WHERE s.email IN ('lisa.brown@clinic.com', 'rachel.kim@clinic.com', 'maya.patel@clinic.com')
ORDER BY s.name;

-- Expected:
-- Lisa Brown: ON LEAVE (Oct 2 is between Oct 2 and Oct 3)
-- Maya Patel: NOT ON LEAVE (Oct 2 is NOT between Oct 5 and Oct 6)
-- Dr. Rachel Kim: NOT ON LEAVE (Oct 2 is NOT between Sept 30 and Oct 1)

-- ===================================================================
-- TROUBLESHOOTING TIPS:
-- ===================================================================
-- 
-- 1. If you see "Oct 2 to Oct 4" in the UI but database says "Oct 2 to Oct 3":
--    - Check for timezone issues
--    - Verify browser console for date display
--    - Clear browser cache and refresh
--
-- 2. If dates still don't match:
--    - Run Step 1 to see actual database dates
--    - Run Step 2 to reset to correct dates
--    - Run Step 3 to verify
--
-- 3. Common date interpretation:
--    - start_date: '2025-10-02' means leave STARTS on Oct 2
--    - end_date: '2025-10-03' means leave ENDS on Oct 3
--    - BOTH days are inclusive (Oct 2 AND Oct 3)
--
-- 4. To add more days:
--    - For 3 days (Oct 2, 3, 4): start='2025-10-02', end='2025-10-04'
--    - For 1 day (Oct 2 only): start='2025-10-02', end='2025-10-02'
--
-- ===================================================================

