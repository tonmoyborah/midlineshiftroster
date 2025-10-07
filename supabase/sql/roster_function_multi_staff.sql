-- Updated get_clinic_roster_for_date function to support multiple staff per clinic
-- Returns arrays of doctors and dental assistants for each clinic

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
    
    -- Get all doctors as JSONB array
    (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name) ORDER BY s.name), '[]'::jsonb)
      FROM public.shift_assignments sa
      JOIN public.staff s ON sa.staff_id = s.id
      WHERE sa.clinic_id = c.id 
        AND sa.shift_date = p_date 
        AND s.role = 'doctor'
        AND s.is_active = true
    ) AS doctors,
    
    -- Get all dental assistants as JSONB array
    (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name) ORDER BY s.name), '[]'::jsonb)
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
    
    -- Determine status (explicitly cast to VARCHAR)
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

-- Test the function
SELECT * FROM public.get_clinic_roster_for_date('2025-10-02');

