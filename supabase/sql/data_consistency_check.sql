-- ================================================================
-- DATA CONSISTENCY CHECK for Oct 2, 2025
-- ================================================================
-- Run this to verify what status each staff member should have
-- ================================================================

-- Oct 2, 2025 is a THURSDAY (day_of_week = 4, where 0=Sunday)

-- Check 1: Show all staff with their expected status on Oct 2, 2025
SELECT 
  s.name,
  s.role,
  s.primary_clinic_id,
  CASE s.weekly_off_day
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as weekly_off,
  
  -- Check if on weekly off
  CASE 
    WHEN s.weekly_off_day = 4 THEN '⚠️ WEEKLY OFF (Thursday)'
    ELSE '✓ Working day'
  END as thursday_status,
  
  -- Check for approved leave
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM leave_requests lr 
      WHERE lr.staff_id = s.id 
        AND lr.status = 'approved'
        AND '2025-10-02'::date BETWEEN lr.start_date AND lr.end_date
    ) THEN '🏖️ APPROVED LEAVE'
    ELSE '✓ Not on leave'
  END as leave_status,
  
  -- Check for pending leave
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM leave_requests lr 
      WHERE lr.staff_id = s.id 
        AND lr.status = 'pending'
        AND '2025-10-02'::date BETWEEN lr.start_date AND lr.end_date
    ) THEN '⏳ PENDING LEAVE'
    ELSE '✓ No pending leave'
  END as pending_leave_status,
  
  -- Final expected status
  CASE 
    WHEN s.weekly_off_day = 4 THEN 'weekly_off'
    WHEN EXISTS (
      SELECT 1 FROM leave_requests lr 
      WHERE lr.staff_id = s.id 
        AND lr.status = 'approved'
        AND '2025-10-02'::date BETWEEN lr.start_date AND lr.end_date
    ) THEN 'approved_leave'
    WHEN EXISTS (
      SELECT 1 FROM leave_requests lr 
      WHERE lr.staff_id = s.id 
        AND lr.status = 'pending'
        AND '2025-10-02'::date BETWEEN lr.start_date AND lr.end_date
    ) THEN 'unapproved_leave'
    ELSE 'available'
  END as expected_status_oct_2

FROM staff s
WHERE s.is_active = true
ORDER BY 
  s.role,
  s.name;

-- ================================================================
-- Check 2: Verify leave request dates
-- ================================================================

SELECT 
  s.name,
  s.role,
  lr.start_date,
  lr.end_date,
  lr.status,
  lr.reason,
  
  -- Check if Oct 2 is in range
  CASE 
    WHEN '2025-10-02'::date BETWEEN lr.start_date AND lr.end_date 
    THEN '✓ Oct 2 IS in range'
    ELSE '✗ Oct 2 NOT in range'
  END as oct_2_check,
  
  -- Show all dates in range
  (lr.end_date - lr.start_date + 1) as total_days

FROM leave_requests lr
JOIN staff s ON lr.staff_id = s.id
ORDER BY lr.start_date;

-- ================================================================
-- Check 3: Expected "Other Staff" for Oct 2, 2025
-- ================================================================
-- These staff should appear in "Other Staff" section (not assigned)

SELECT 
  'AVAILABLE on Oct 2' as category,
  s.name,
  s.role,
  c.name as primary_clinic
FROM staff s
LEFT JOIN clinics c ON s.primary_clinic_id = c.id
WHERE s.is_active = true
  AND s.weekly_off_day != 4  -- Not weekly off on Thursday
  AND NOT EXISTS (  -- Not on approved leave
    SELECT 1 FROM leave_requests lr 
    WHERE lr.staff_id = s.id 
      AND lr.status = 'approved'
      AND '2025-10-02'::date BETWEEN lr.start_date AND lr.end_date
  )
ORDER BY s.role, s.name;

-- ================================================================
-- Check 4: Staff who should NOT appear (on leave or weekly off)
-- ================================================================

SELECT 
  CASE 
    WHEN s.weekly_off_day = 4 THEN 'WEEKLY OFF'
    WHEN lr.status = 'approved' THEN 'APPROVED LEAVE'
    ELSE 'OTHER'
  END as reason,
  s.name,
  s.role,
  c.name as primary_clinic,
  lr.start_date,
  lr.end_date
FROM staff s
LEFT JOIN clinics c ON s.primary_clinic_id = c.id
LEFT JOIN leave_requests lr ON s.id = lr.staff_id 
  AND lr.status = 'approved'
  AND '2025-10-02'::date BETWEEN lr.start_date AND lr.end_date
WHERE s.is_active = true
  AND (
    s.weekly_off_day = 4  -- Weekly off on Thursday
    OR lr.id IS NOT NULL  -- On approved leave
  )
ORDER BY reason, s.name;

-- ================================================================
-- EXPECTED RESULTS for Oct 2, 2025:
-- ================================================================
-- 
-- Should be AVAILABLE (18 staff):
--   - All 20 staff
--   - MINUS Lisa Brown (approved leave Oct 2-3)
--   - MINUS Dr. Kevin Lee (weekly off Thursday)
--   - MINUS Brian Taylor (weekly off Thursday)
--   = 17 staff available
--
-- Should NOT appear in "Other Staff":
--   - Lisa Brown (approved leave)
--   - Dr. Kevin Lee (weekly off)
--   - Brian Taylor (weekly off)
--
-- ================================================================

