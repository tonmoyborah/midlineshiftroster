-- Fix for get_clinic_roster_for_date function (Type-corrected version)
-- This version uses subqueries and explicit type casting

DROP FUNCTION IF EXISTS public.get_clinic_roster_for_date(DATE);

CREATE OR REPLACE FUNCTION public.get_clinic_roster_for_date(p_date DATE)
RETURNS TABLE (
  clinic_id UUID,
  clinic_name VARCHAR,
  clinic_location VARCHAR,
  doctor_id UUID,
  doctor_name VARCHAR,
  da_id UUID,
  da_name VARCHAR,
  notes TEXT,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS clinic_id,
    c.name AS clinic_name,
    c.location AS clinic_location,
    -- Get doctor info using subquery
    (
      SELECT sa.staff_id
      FROM public.shift_assignments sa
      JOIN public.staff s ON sa.staff_id = s.id
      WHERE sa.clinic_id = c.id 
        AND sa.shift_date = p_date 
        AND s.role = 'doctor'
      LIMIT 1
    ) AS doctor_id,
    (
      SELECT s.name
      FROM public.shift_assignments sa
      JOIN public.staff s ON sa.staff_id = s.id
      WHERE sa.clinic_id = c.id 
        AND sa.shift_date = p_date 
        AND s.role = 'doctor'
      LIMIT 1
    ) AS doctor_name,
    -- Get dental assistant info using subquery
    (
      SELECT sa.staff_id
      FROM public.shift_assignments sa
      JOIN public.staff s ON sa.staff_id = s.id
      WHERE sa.clinic_id = c.id 
        AND sa.shift_date = p_date 
        AND s.role = 'dental_assistant'
      LIMIT 1
    ) AS da_id,
    (
      SELECT s.name
      FROM public.shift_assignments sa
      JOIN public.staff s ON sa.staff_id = s.id
      WHERE sa.clinic_id = c.id 
        AND sa.shift_date = p_date 
        AND s.role = 'dental_assistant'
      LIMIT 1
    ) AS da_name,
    -- Get notes
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
      ) OR NOT EXISTS (
        SELECT 1
        FROM public.shift_assignments sa
        JOIN public.staff s ON sa.staff_id = s.id
        WHERE sa.clinic_id = c.id 
          AND sa.shift_date = p_date 
          AND s.role = 'dental_assistant'
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
