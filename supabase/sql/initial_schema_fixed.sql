-- Shift Manager - Initial Schema (v1.1 - Fixed)
-- Apply this in Supabase SQL Editor (SQL -> New query), run all at once.
-- Safe to re-run due to IF NOT EXISTS and CREATE OR REPLACE usage where possible.

-- =============================
-- Extensions
-- =============================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- =============================
-- Tables
-- =============================


-- DELETE FROM shift_assignments;
-- DELETE FROM leave_requests;
-- DELETE FROM staff;
-- DELETE FROM clinics;

-- Clinics table
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clinics_active ON public.clinics(is_active);

-- Staff table
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('doctor','dental_assistant','admin')),
  primary_clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  weekly_off_day INTEGER CHECK (weekly_off_day >= 0 AND weekly_off_day <= 6),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_staff_role ON public.staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_primary_clinic ON public.staff(primary_clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_active ON public.staff(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);

-- Staff working days table
CREATE TABLE IF NOT EXISTS public.staff_working_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_working BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, day_of_week)
);
CREATE INDEX IF NOT EXISTS idx_staff_working_days_staff ON public.staff_working_days(staff_id);

-- Leave requests table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('planned','emergency')),
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS idx_leave_requests_staff ON public.leave_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_date_range ON public.leave_requests USING gist (daterange(start_date, end_date, '[]'));

-- Shift assignments table
CREATE TABLE IF NOT EXISTS public.shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  is_visiting BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(clinic_id, staff_id, shift_date)
);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_clinic_date ON public.shift_assignments(clinic_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_staff_date ON public.shift_assignments(staff_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_date ON public.shift_assignments(shift_date);

-- Unapproved absences table
CREATE TABLE IF NOT EXISTS public.unapproved_absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  absence_date DATE NOT NULL,
  reason VARCHAR(50) CHECK (reason IN ('no_show','rejected_leave')),
  notes TEXT,
  marked_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, absence_date)
);
CREATE INDEX IF NOT EXISTS idx_unapproved_absences_staff ON public.unapproved_absences(staff_id);
CREATE INDEX IF NOT EXISTS idx_unapproved_absences_date ON public.unapproved_absences(absence_date);

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- =============================
-- Triggers: updated_at maintenance
-- =============================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_clinics_updated_at ON public.clinics;
CREATE TRIGGER update_clinics_updated_at 
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON public.staff;
CREATE TRIGGER update_staff_updated_at 
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON public.leave_requests;
CREATE TRIGGER update_leave_requests_updated_at 
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shift_assignments_updated_at ON public.shift_assignments;
CREATE TRIGGER update_shift_assignments_updated_at 
  BEFORE UPDATE ON public.shift_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================
-- Functions (RPC helpers)
-- =============================

-- Function to get staff status for a specific date
CREATE OR REPLACE FUNCTION public.get_staff_status_for_date(
  p_staff_id UUID,
  p_date DATE
) RETURNS VARCHAR AS $$
DECLARE
  v_day_of_week INTEGER;
  v_weekly_off INTEGER;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  SELECT weekly_off_day INTO v_weekly_off 
  FROM public.staff 
  WHERE id = p_staff_id;
  
  IF v_weekly_off IS NOT NULL AND v_weekly_off = v_day_of_week THEN
    RETURN 'weekly_off';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.leave_requests
    WHERE staff_id = p_staff_id 
      AND status = 'approved'
      AND p_date BETWEEN start_date AND end_date
  ) THEN
    RETURN 'approved_leave';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.unapproved_absences
    WHERE staff_id = p_staff_id 
      AND absence_date = p_date
  ) THEN
    RETURN 'unapproved_leave';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.shift_assignments
    WHERE staff_id = p_staff_id 
      AND shift_date = p_date
  ) THEN
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
  
  RETURN 'available';
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix for get_clinic_roster_for_date function (Type-corrected version)
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
    (
      SELECT sa.notes
      FROM public.shift_assignments sa
      WHERE sa.clinic_id = c.id 
        AND sa.shift_date = p_date 
        AND sa.notes IS NOT NULL
      LIMIT 1
    ) AS notes,
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

-- =============================
-- Row Level Security (RLS)
-- =============================

-- Enable RLS on all tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_working_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unapproved_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================
-- RLS Policies
-- =============================

-- Drop existing policies (for clean re-run)
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

-- Admin policies (full access)
CREATE POLICY "Admins full on clinics" 
  ON public.clinics FOR ALL 
  TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins full on staff" 
  ON public.staff FOR ALL 
  TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins full on staff_working_days" 
  ON public.staff_working_days FOR ALL 
  TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins full on leave_requests" 
  ON public.leave_requests FOR ALL 
  TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins full on shift_assignments" 
  ON public.shift_assignments FOR ALL 
  TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins full on unapproved_absences" 
  ON public.unapproved_absences FOR ALL 
  TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins read admin_users" 
  ON public.admin_users FOR SELECT 
  TO authenticated 
  USING (public.is_admin());

-- Staff policies (limited access)
CREATE POLICY "Staff view self" 
  ON public.staff FOR SELECT 
  TO authenticated 
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Staff create own leave" 
  ON public.leave_requests FOR INSERT 
  TO authenticated 
  WITH CHECK (staff_id IN (
    SELECT id FROM public.staff WHERE email = auth.jwt() ->> 'email'
  ));

CREATE POLICY "Staff view own leave" 
  ON public.leave_requests FOR SELECT 
  TO authenticated 
  USING (staff_id IN (
    SELECT id FROM public.staff WHERE email = auth.jwt() ->> 'email'
  ));

-- Public read access (for development - REMOVE IN PRODUCTION!)
CREATE POLICY "Public read clinics" 
  ON public.clinics FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Public read staff" 
  ON public.staff FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Public read shift_assignments" 
  ON public.shift_assignments FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Public read leave_requests" 
  ON public.leave_requests FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- =============================
-- Realtime Publication
-- =============================

-- Add tables to realtime publication (ignore errors if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.shift_assignments;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================
-- Seed Data (idempotent)
-- =============================

-- Insert clinics if they don't exist
INSERT INTO public.clinics(name, location)
SELECT * FROM (
  VALUES 
    ('Central Clinic', 'Downtown'),
    ('North Branch', 'Northside'),
    ('East Branch', 'Eastwood')
) AS v(name, location)
WHERE NOT EXISTS (SELECT 1 FROM public.clinics);

-- Insert sample staff if none exist (20 staff members)
DO $$
DECLARE
  central_id UUID;
  north_id UUID;
  east_id UUID;
BEGIN
  -- Only insert if no staff exists
  IF NOT EXISTS (SELECT 1 FROM public.staff LIMIT 1) THEN
    -- Get clinic IDs
    SELECT id INTO central_id FROM public.clinics WHERE name = 'Central Clinic';
    SELECT id INTO north_id FROM public.clinics WHERE name = 'North Branch';
    SELECT id INTO east_id FROM public.clinics WHERE name = 'East Branch';
    
    -- Insert 20 staff members (10 doctors + 10 dental assistants)
    INSERT INTO public.staff (email, name, role, primary_clinic_id, weekly_off_day, is_active) VALUES
      -- Central Clinic Staff (7 total: 4 doctors + 3 DAs)
      ('sarah.chen@clinic.com', 'Dr. Sarah Chen', 'doctor', central_id, 0, true),
      ('michael.smith@clinic.com', 'Dr. Michael Smith', 'doctor', central_id, 1, true),
      ('rachel.kim@clinic.com', 'Dr. Rachel Kim', 'doctor', central_id, 2, true),
      ('david.patel@clinic.com', 'Dr. David Patel', 'doctor', central_id, 0, true),
      ('maya.patel@clinic.com', 'Maya Patel', 'dental_assistant', central_id, 3, true),
      ('jessica.wong@clinic.com', 'Jessica Wong', 'dental_assistant', central_id, 0, true),
      ('carlos.rivera@clinic.com', 'Carlos Rivera', 'dental_assistant', central_id, 5, true),
      
      -- North Branch Staff (7 total: 3 doctors + 4 DAs)
      ('james.wilson@clinic.com', 'Dr. James Wilson', 'doctor', north_id, 1, true),
      ('emily.brooks@clinic.com', 'Dr. Emily Brooks', 'doctor', north_id, 2, true),
      ('kevin.lee@clinic.com', 'Dr. Kevin Lee', 'doctor', north_id, 4, true),
      ('lisa.brown@clinic.com', 'Lisa Brown', 'dental_assistant', north_id, 0, true),
      ('anna.lee@clinic.com', 'Anna Lee', 'dental_assistant', north_id, 5, true),
      ('robert.garcia@clinic.com', 'Robert Garcia', 'dental_assistant', north_id, 1, true),
      ('sophia.martinez@clinic.com', 'Sophia Martinez', 'dental_assistant', north_id, 6, true),
      
      -- East Branch Staff (6 total: 3 doctors + 3 DAs)
      ('amanda.johnson@clinic.com', 'Dr. Amanda Johnson', 'doctor', east_id, 0, true),
      ('thomas.nguyen@clinic.com', 'Dr. Thomas Nguyen', 'doctor', east_id, 3, true),
      ('linda.harris@clinic.com', 'Dr. Linda Harris', 'doctor', east_id, 1, true),
      ('tom.harris@clinic.com', 'Tom Harris', 'dental_assistant', east_id, 2, true),
      ('nicole.anderson@clinic.com', 'Nicole Anderson', 'dental_assistant', east_id, 0, true),
      ('brian.taylor@clinic.com', 'Brian Taylor', 'dental_assistant', east_id, 4, true);
  END IF;
END $$;

-- No initial shift assignments - start with empty roster
-- Users can assign staff to clinics through the UI

-- Insert initial leave requests (3 total: 2 approved, 1 pending)
-- CRITICAL: status field ('approved'/'pending'/'rejected') determines the badge shown
-- CRITICAL: leave_type field ('planned'/'emergency') is just metadata for categorization
-- CRITICAL: PostgreSQL BETWEEN is INCLUSIVE: date BETWEEN start AND end includes both boundaries

INSERT INTO public.leave_requests (staff_id, start_date, end_date, leave_type, reason, status, notes)
SELECT 
  s.id,
  DATE(leave_start),
  DATE(leave_end),
  leave_type_val,
  reason_val,
  status_val,
  notes_val
FROM (
  VALUES 
    -- Lisa Brown: Oct 2-3, 2025 (2 days: Oct 2 AND Oct 3)
    -- status='approved' means both days show "approved_leave" badge
    -- Expected: Oct 2 = approved_leave, Oct 3 = approved_leave, Oct 4 = available
    ('lisa.brown@clinic.com', '2025-10-02', '2025-10-03', 'planned', 'Family event', 'approved', 'Approved by manager'),
    
    -- Dr. Kevin Lee: Oct 8-9, 2025 (2 days: Oct 8 AND Oct 9)
    -- status='approved' means both days show "approved_leave" badge
    -- Expected: Oct 2 = weekly_off, Oct 8 = approved_leave, Oct 9 = approved_leave, Oct 10 = available
    ('kevin.lee@clinic.com', '2025-10-08', '2025-10-09', 'planned', 'Conference', 'approved', 'Medical conference'),
    
    -- Sophia Martinez: Oct 11, 2025 (1 day: Oct 11 only)
    -- status='pending' means Oct 11 shows "unapproved_leave" badge
    -- Expected: Oct 11 = unapproved_leave, Oct 12 = available
    ('sophia.martinez@clinic.com', '2025-10-11', '2025-10-11', 'planned', 'Personal', 'pending', NULL)
) AS leave_vals(staff_email, leave_start, leave_end, leave_type_val, reason_val, status_val, notes_val)
INNER JOIN public.staff s ON s.email = leave_vals.staff_email;

-- =============================
-- Success Message
-- =============================
DO $$
BEGIN
  RAISE NOTICE '✅ Schema setup complete! Tables, functions, RLS policies, and initial data have been created.';
  RAISE NOTICE '📊 Initial State:';
  RAISE NOTICE '   • 3 Clinics (Central, North, East)';
  RAISE NOTICE '   • 20 Staff Members (10 Doctors + 10 Dental Assistants)';
  RAISE NOTICE '   • 3 Leave Requests (2 Approved + 1 Pending)';
  RAISE NOTICE '   • 0 Shift Assignments (All clinics empty - ready for assignment)';
  RAISE NOTICE 'ℹ️  Note: Public read access is enabled for development. Remove these policies in production.';
END $$;

