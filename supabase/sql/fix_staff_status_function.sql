-- Fix staff status determination function
-- This update ensures proper handling of all leave types and absences
-- Updated: 2025-10-12

-- Function to get staff status for a specific date
CREATE OR REPLACE FUNCTION public.get_staff_status_for_date(
  p_staff_id UUID,
  p_date DATE
) RETURNS VARCHAR AS $$
DECLARE
  v_day_of_week INTEGER;
  v_weekly_off INTEGER;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Get staff's weekly off day
  SELECT weekly_off_day INTO v_weekly_off 
  FROM public.staff 
  WHERE id = p_staff_id;
  
  -- Priority 1: Check if it's their weekly off day
  IF v_weekly_off IS NOT NULL AND v_weekly_off = v_day_of_week THEN
    RETURN 'weekly_off';
  END IF;
  
  -- Priority 2: Check approved leave
  IF EXISTS (
    SELECT 1 FROM public.leave_requests
    WHERE staff_id = p_staff_id 
      AND status = 'approved'
      AND p_date BETWEEN start_date AND end_date
  ) THEN
    RETURN 'approved_leave';
  END IF;
  
  -- Priority 3: Check pending leave (unapproved leave request)
  IF EXISTS (
    SELECT 1 FROM public.leave_requests
    WHERE staff_id = p_staff_id 
      AND status = 'pending'
      AND p_date BETWEEN start_date AND end_date
  ) THEN
    RETURN 'unapproved_leave';
  END IF;
  
  -- Priority 4: Check manually marked unapproved absences
  IF EXISTS (
    SELECT 1 FROM public.unapproved_absences
    WHERE staff_id = p_staff_id 
      AND absence_date = p_date
  ) THEN
    RETURN 'unapproved_leave';
  END IF;
  
  -- Note: Rejected leaves are ignored - staff is available if leave was rejected
  
  -- Priority 5: Check if assigned to any clinic
  IF EXISTS (
    SELECT 1 FROM public.shift_assignments
    WHERE staff_id = p_staff_id 
      AND shift_date = p_date
  ) THEN
    -- Check if visiting (assigned to non-primary clinic)
    IF EXISTS (
      SELECT 1 FROM public.shift_assignments sa
      JOIN public.staff s ON sa.staff_id = s.id
      WHERE sa.staff_id = p_staff_id 
        AND sa.shift_date = p_date 
        AND sa.clinic_id <> s.primary_clinic_id
    ) THEN
      RETURN 'visiting';
    END IF;
    RETURN 'present';
  END IF;
  
  -- Default: Staff is available (active, not on leave, not assigned)
  RETURN 'available';
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_staff_status_for_date(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_status_for_date(UUID, DATE) TO anon;

-- Test the function with sample data
-- SELECT public.get_staff_status_for_date(
--   (SELECT id FROM public.staff WHERE email = 'sarah.chen@clinic.com'),
--   '2025-10-02'
-- );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Staff status function updated successfully!';
  RAISE NOTICE 'ℹ️  Status priority order:';
  RAISE NOTICE '   1. Weekly Off';
  RAISE NOTICE '   2. Approved Leave';
  RAISE NOTICE '   3. Pending Leave (unapproved)';
  RAISE NOTICE '   4. Manually Marked Absence (unapproved)';
  RAISE NOTICE '   5. Present (assigned to primary clinic)';
  RAISE NOTICE '   6. Visiting (assigned to non-primary clinic)';
  RAISE NOTICE '   7. Available (default - not assigned, no leaves)';
  RAISE NOTICE '   Note: Rejected leaves are ignored - staff becomes available';
END $$;

