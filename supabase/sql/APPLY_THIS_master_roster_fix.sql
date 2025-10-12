-- ============================================================================
-- MASTER ROSTER FIX - Apply this to fix staff not appearing in clinics
-- ============================================================================
-- Date: 2025-10-12
-- This migration:
-- 1. Drops ALL old roster function versions
-- 2. Applies the correct roster function with individual staff status
-- 3. Verifies the function works
-- ============================================================================

-- Step 1: Drop all old versions of the roster function
DO $$
BEGIN
  RAISE NOTICE '🔧 Step 1: Cleaning up old roster function versions...';
END $$;

DROP FUNCTION IF EXISTS public.get_clinic_roster_for_date(DATE) CASCADE;

-- Step 2: Create the correct roster function that returns arrays with status
DO $$
BEGIN
  RAISE NOTICE '🔧 Step 2: Creating correct roster function...';
END $$;

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

-- Step 3: Grant permissions
DO $$
BEGIN
  RAISE NOTICE '🔧 Step 3: Granting permissions...';
END $$;

GRANT EXECUTE ON FUNCTION public.get_clinic_roster_for_date(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_clinic_roster_for_date(DATE) TO anon;

-- Step 4: Test the function with today's date
DO $$
DECLARE
  v_result RECORD;
  v_test_date DATE := '2025-10-02';
BEGIN
  RAISE NOTICE '🔧 Step 4: Testing roster function with date: %', v_test_date;
  
  -- Test query
  FOR v_result IN 
    SELECT * FROM public.get_clinic_roster_for_date(v_test_date) LIMIT 1
  LOOP
    RAISE NOTICE '✅ Function works! Sample clinic: %', v_result.clinic_name;
    RAISE NOTICE '   Doctors array type: %', pg_typeof(v_result.doctors);
    RAISE NOTICE '   DAs array type: %', pg_typeof(v_result.dental_assistants);
  END LOOP;
END $$;

-- Step 5: Verify data format
DO $$
DECLARE
  v_sample JSONB;
BEGIN
  RAISE NOTICE '🔧 Step 5: Verifying data format...';
  
  -- Get a sample doctor array
  SELECT doctors INTO v_sample
  FROM public.get_clinic_roster_for_date('2025-10-02')
  WHERE jsonb_array_length(doctors) > 0
  LIMIT 1;
  
  IF v_sample IS NOT NULL THEN
    RAISE NOTICE '✅ Sample doctor data: %', v_sample;
    RAISE NOTICE '✅ First doctor has id: %', v_sample->0->'id' IS NOT NULL;
    RAISE NOTICE '✅ First doctor has name: %', v_sample->0->'name' IS NOT NULL;
    RAISE NOTICE '✅ First doctor has status: %', v_sample->0->'status' IS NOT NULL;
    RAISE NOTICE '✅ First doctor has is_visiting: %', v_sample->0->'is_visiting' IS NOT NULL;
  ELSE
    RAISE NOTICE '⚠️  No assigned doctors found for test date. This is OK if no staff are assigned yet.';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ MASTER ROSTER FIX APPLIED SUCCESSFULLY!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'What was fixed:';
  RAISE NOTICE '  ✅ Removed old roster function versions';
  RAISE NOTICE '  ✅ Created correct roster function that returns:';
  RAISE NOTICE '     - doctors as JSONB array';
  RAISE NOTICE '     - dental_assistants as JSONB array';
  RAISE NOTICE '     - Each with: id, name, status, is_visiting';
  RAISE NOTICE '  ✅ Individual staff status from get_staff_status_for_date()';
  RAISE NOTICE '  ✅ Proper permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Deploy frontend changes (git push)';
  RAISE NOTICE '  2. Hard refresh browser (Ctrl+Shift+R)';
  RAISE NOTICE '  3. Check Daily Shifts page - staff should appear in clinics!';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;

