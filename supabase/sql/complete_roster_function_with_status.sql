-- Complete get_clinic_roster_for_date function with individual staff status
-- This function returns doctors and dental assistants as JSONB arrays
-- Each staff member includes their individual status from get_staff_status_for_date
-- Date: 2025-10-12

DROP FUNCTION IF EXISTS public.get_clinic_roster_for_date(DATE);

CREATE OR REPLACE FUNCTION public.get_clinic_roster_for_date(p_date DATE)
RETURNS TABLE (
  clinic_id UUID,
  clinic_name VARCHAR,
  clinic_location VARCHAR,
  doctors JSONB,
  dental_assistants JSONB,
  notes TEXT,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS clinic_id,
    c.name AS clinic_name,
    c.location AS clinic_location,
    
    -- Get all doctors with their individual status
    (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'status', public.get_staff_status_for_date(s.id, p_date),
            'is_visiting', sa.is_visiting
          ) ORDER BY s.name
        ),
        '[]'::jsonb
      )
      FROM public.shift_assignments sa
      JOIN public.staff s ON sa.staff_id = s.id
      WHERE sa.clinic_id = c.id 
        AND sa.shift_date = p_date 
        AND s.role = 'doctor'
        AND s.is_active = true
    ) AS doctors,
    
    -- Get all dental assistants with their individual status
    (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'status', public.get_staff_status_for_date(s.id, p_date),
            'is_visiting', sa.is_visiting
          ) ORDER BY s.name
        ),
        '[]'::jsonb
      )
      FROM public.shift_assignments sa
      JOIN public.staff s ON sa.staff_id = s.id
      WHERE sa.clinic_id = c.id 
        AND sa.shift_date = p_date 
        AND s.role = 'dental_assistant'
        AND s.is_active = true
    ) AS dental_assistants,
    
    -- Get notes (first non-null note)
    (
      SELECT sa.notes
      FROM public.shift_assignments sa
      WHERE sa.clinic_id = c.id 
        AND sa.shift_date = p_date 
        AND sa.notes IS NOT NULL
      LIMIT 1
    ) AS notes,
    
    -- Determine overall clinic status
    (CASE
      WHEN NOT EXISTS (
        SELECT 1
        FROM public.shift_assignments sa
        JOIN public.staff s ON sa.staff_id = s.id
        WHERE sa.clinic_id = c.id 
          AND sa.shift_date = p_date 
          AND s.role = 'doctor'
          AND s.is_active = true
      ) OR NOT EXISTS (
        SELECT 1
        FROM public.shift_assignments sa
        JOIN public.staff s ON sa.staff_id = s.id
        WHERE sa.clinic_id = c.id 
          AND sa.shift_date = p_date 
          AND s.role = 'dental_assistant'
          AND s.is_active = true
      ) THEN 'no_staff'
      WHEN EXISTS (
        SELECT 1
        FROM public.shift_assignments sa
        WHERE sa.clinic_id = c.id 
          AND sa.shift_date = p_date 
          AND sa.is_visiting = true
      ) THEN 'visiting'
      ELSE 'present'
    END)::VARCHAR AS status
  FROM public.clinics c
  WHERE c.is_active = true
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_clinic_roster_for_date(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_clinic_roster_for_date(DATE) TO anon;

-- Test the function
-- SELECT * FROM public.get_clinic_roster_for_date('2025-10-02');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Complete roster function created with individual staff status!';
  RAISE NOTICE 'ℹ️  This function now returns:';
  RAISE NOTICE '   • doctors as JSONB array with id, name, status, is_visiting';
  RAISE NOTICE '   • dental_assistants as JSONB array with id, name, status, is_visiting';
  RAISE NOTICE '   • Individual status for each staff member from get_staff_status_for_date()';
  RAISE NOTICE '   • Properly integrates all status types including available';
END $$;

