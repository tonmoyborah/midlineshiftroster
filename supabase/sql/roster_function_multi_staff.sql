-- Updated get_clinic_roster_for_date function to support individual staff statuses
-- Returns arrays of doctors and dental assistants with their individual statuses

DROP FUNCTION IF EXISTS public.get_clinic_roster_for_date(DATE);

CREATE OR REPLACE FUNCTION public.get_clinic_roster_for_date(p_date DATE)
RETURNS TABLE (
  clinic_id UUID,
  clinic_name VARCHAR,
  clinic_location VARCHAR,
  doctors JSONB,
  dental_assistants JSONB,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS clinic_id,
    c.name AS clinic_name,
    c.location AS clinic_location,
    
    -- Get all doctors as JSONB array with individual statuses
    (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', s.id, 
            'name', s.name,
            'status', CASE WHEN sa.is_visiting THEN 'visiting' ELSE 'present' END,
            'is_visiting', sa.is_visiting
          ) 
          ORDER BY s.name
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
    
    -- Get all dental assistants as JSONB array with individual statuses
    (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', s.id, 
            'name', s.name,
            'status', CASE WHEN sa.is_visiting THEN 'visiting' ELSE 'present' END,
            'is_visiting', sa.is_visiting
          ) 
          ORDER BY s.name
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
    ) AS notes
  FROM public.clinics c
  WHERE c.is_active = true
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Test the function
SELECT * FROM public.get_clinic_roster_for_date('2025-10-02');

