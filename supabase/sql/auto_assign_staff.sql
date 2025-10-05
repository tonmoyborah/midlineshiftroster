-- Auto-assign staff to their primary clinics for a specific date
-- This function assigns all available staff to their primary clinic
-- Respects: weekly off days, approved leave, inactive staff

CREATE OR REPLACE FUNCTION public.auto_assign_staff_to_primary_clinics(p_date DATE)
RETURNS TABLE (
  assigned_count INTEGER,
  skipped_count INTEGER,
  message TEXT
) AS $$
DECLARE
  v_assigned_count INTEGER := 0;
  v_skipped_count INTEGER := 0;
  v_staff_record RECORD;
  v_day_of_week INTEGER;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Loop through all active staff who have a primary clinic
  FOR v_staff_record IN
    SELECT 
      s.id AS staff_id,
      s.primary_clinic_id,
      s.weekly_off_day,
      s.name,
      s.role
    FROM public.staff s
    WHERE s.is_active = true
      AND s.primary_clinic_id IS NOT NULL
  LOOP
    -- Check if staff should be skipped
    
    -- Skip if it's their weekly off day
    IF v_staff_record.weekly_off_day = v_day_of_week THEN
      v_skipped_count := v_skipped_count + 1;
      RAISE NOTICE 'Skipped %: Weekly off day', v_staff_record.name;
      CONTINUE;
    END IF;
    
    -- Skip if they're on approved leave
    IF EXISTS (
      SELECT 1
      FROM public.leave_requests lr
      WHERE lr.staff_id = v_staff_record.staff_id
        AND lr.status = 'approved'
        AND p_date BETWEEN lr.start_date AND lr.end_date
    ) THEN
      v_skipped_count := v_skipped_count + 1;
      RAISE NOTICE 'Skipped %: On approved leave', v_staff_record.name;
      CONTINUE;
    END IF;
    
    -- Skip if already assigned to ANY clinic for this date
    IF EXISTS (
      SELECT 1
      FROM public.shift_assignments sa
      WHERE sa.staff_id = v_staff_record.staff_id
        AND sa.shift_date = p_date
    ) THEN
      v_skipped_count := v_skipped_count + 1;
      RAISE NOTICE 'Skipped %: Already assigned', v_staff_record.name;
      CONTINUE;
    END IF;
    
    -- Assign staff to their primary clinic
    INSERT INTO public.shift_assignments (
      clinic_id,
      staff_id,
      shift_date,
      is_visiting,
      notes
    ) VALUES (
      v_staff_record.primary_clinic_id,
      v_staff_record.staff_id,
      p_date,
      false,  -- Not visiting since it's their primary clinic
      'Auto-assigned to primary clinic'
    )
    ON CONFLICT (clinic_id, staff_id, shift_date) DO NOTHING;
    
    v_assigned_count := v_assigned_count + 1;
    RAISE NOTICE 'Assigned %: to primary clinic', v_staff_record.name;
  END LOOP;
  
  -- Return summary
  RETURN QUERY
  SELECT 
    v_assigned_count,
    v_skipped_count,
    format('Auto-assigned %s staff to primary clinics. Skipped %s staff (on leave, weekly off, or already assigned).', 
           v_assigned_count, v_skipped_count)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.auto_assign_staff_to_primary_clinics(DATE) TO authenticated;

-- Test the function
-- SELECT * FROM public.auto_assign_staff_to_primary_clinics('2025-10-02');

-- Example usage:
-- This will auto-assign all available staff to their primary clinics for Oct 2, 2025
-- CALL or SELECT * FROM public.auto_assign_staff_to_primary_clinics('2025-10-02');
