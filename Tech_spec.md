# Shift Manager - Technical Specification v1.0

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Database Schema](#database-schema)
3. [Supabase Best Practices](#supabase-best-practices)
4. [Project Structure](#project-structure)
5. [API Layer](#api-layer)
6. [State Management](#state-management)
7. [Feature Implementation](#feature-implementation)
8. [Security & Performance](#security-performance)
9. [Testing Strategy](#testing-strategy)

---

## 1. Technology Stack

### Frontend
- **React 18** - UI library with concurrent features
- **TypeScript 5+** - Type safety and developer experience
- **Vite 5+** - Fast development and optimized builds
- **Tailwind CSS v3** - Utility-first styling
- **React Router v6** - Client-side routing
- **TanStack Query (React Query) v5** - Server state management
- **Zustand** - Client state management (minimal, if needed)
- **React Hook Form** - Form handling and validation
- **Zod** - Runtime type validation
- **date-fns** - Date manipulation
- **Lucide React** - Icon library

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Authentication
  - Storage (if needed for future features)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Husky** - Git hooks

---

## 2. Database Schema

### Tables

#### `clinics`
```sql
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active clinics
CREATE INDEX idx_clinics_active ON clinics(is_active);
```

#### `staff`
```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('doctor', 'dental_assistant')),
  primary_clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  weekly_off_day INTEGER CHECK (weekly_off_day >= 0 AND weekly_off_day <= 6), -- 0=Sunday, 6=Saturday
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_primary_clinic ON staff(primary_clinic_id);
CREATE INDEX idx_staff_active ON staff(is_active);
CREATE INDEX idx_staff_email ON staff(email);
```

#### `staff_working_days`
```sql
CREATE TABLE staff_working_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_working BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, day_of_week)
);

-- Index for quick lookups
CREATE INDEX idx_staff_working_days_staff ON staff_working_days(staff_id);
```

#### `leave_requests`
```sql
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('planned', 'emergency')),
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id), -- Admin who approved/rejected
  approved_at TIMESTAMPTZ,
  notes TEXT, -- Admin notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_leave_requests_staff ON leave_requests(staff_id);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_date_range ON leave_requests USING GIST (daterange(start_date, end_date, '[]'));
```

#### `shift_assignments`
```sql
CREATE TABLE shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  is_visiting BOOLEAN DEFAULT false, -- true if assigned to non-primary clinic
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(clinic_id, staff_id, shift_date)
);

-- Indexes
CREATE INDEX idx_shift_assignments_clinic_date ON shift_assignments(clinic_id, shift_date);
CREATE INDEX idx_shift_assignments_staff_date ON shift_assignments(staff_id, shift_date);
CREATE INDEX idx_shift_assignments_date ON shift_assignments(shift_date);
```

#### `unapproved_absences`
```sql
CREATE TABLE unapproved_absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  absence_date DATE NOT NULL,
  reason VARCHAR(50) CHECK (reason IN ('no_show', 'rejected_leave')),
  notes TEXT,
  marked_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(staff_id, absence_date)
);

-- Indexes
CREATE INDEX idx_unapproved_absences_staff ON unapproved_absences(staff_id);
CREATE INDEX idx_unapproved_absences_date ON unapproved_absences(absence_date);
```

#### `admin_users`
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_admin_users_email ON admin_users(email);
```

### Database Functions

#### `get_staff_status_for_date`
```sql
CREATE OR REPLACE FUNCTION get_staff_status_for_date(
  p_staff_id UUID,
  p_date DATE
)
RETURNS VARCHAR AS $$
DECLARE
  v_status VARCHAR;
  v_day_of_week INTEGER;
  v_weekly_off INTEGER;
BEGIN
  -- Get day of week (0=Sunday, 6=Saturday)
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Check weekly off
  SELECT weekly_off_day INTO v_weekly_off
  FROM staff
  WHERE id = p_staff_id;
  
  IF v_weekly_off = v_day_of_week THEN
    RETURN 'weekly_off';
  END IF;
  
  -- Check approved leave
  IF EXISTS (
    SELECT 1 FROM leave_requests
    WHERE staff_id = p_staff_id
      AND status = 'approved'
      AND p_date BETWEEN start_date AND end_date
  ) THEN
    RETURN 'approved_leave';
  END IF;
  
  -- Check unapproved absence
  IF EXISTS (
    SELECT 1 FROM unapproved_absences
    WHERE staff_id = p_staff_id
      AND absence_date = p_date
  ) THEN
    RETURN 'unapproved_leave';
  END IF;
  
  -- Check if assigned
  IF EXISTS (
    SELECT 1 FROM shift_assignments
    WHERE staff_id = p_staff_id
      AND shift_date = p_date
  ) THEN
    -- Check if visiting
    IF EXISTS (
      SELECT 1 FROM shift_assignments sa
      JOIN staff s ON sa.staff_id = s.id
      WHERE sa.staff_id = p_staff_id
        AND sa.shift_date = p_date
        AND sa.clinic_id != s.primary_clinic_id
    ) THEN
      RETURN 'visiting';
    END IF;
    
    RETURN 'present';
  END IF;
  
  RETURN 'available';
END;
$$ LANGUAGE plpgsql;
```

#### `get_clinic_roster_for_date`
```sql
CREATE OR REPLACE FUNCTION get_clinic_roster_for_date(p_date DATE)
RETURNS TABLE (
  clinic_id UUID,
  clinic_name VARCHAR,
  doctor_id UUID,
  doctor_name VARCHAR,
  da_id UUID,
  da_name VARCHAR,
  notes TEXT,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH clinic_assignments AS (
    SELECT 
      c.id as clinic_id,
      c.name as clinic_name,
      sa.staff_id,
      s.name as staff_name,
      s.role,
      sa.notes,
      sa.is_visiting
    FROM clinics c
    LEFT JOIN shift_assignments sa ON c.id = sa.clinic_id AND sa.shift_date = p_date
    LEFT JOIN staff s ON sa.staff_id = s.id
    WHERE c.is_active = true
  )
  SELECT 
    ca.clinic_id,
    ca.clinic_name,
    MAX(CASE WHEN ca.role = 'doctor' THEN ca.staff_id END) as doctor_id,
    MAX(CASE WHEN ca.role = 'doctor' THEN ca.staff_name END) as doctor_name,
    MAX(CASE WHEN ca.role = 'dental_assistant' THEN ca.staff_id END) as da_id,
    MAX(CASE WHEN ca.role = 'dental_assistant' THEN ca.staff_name END) as da_name,
    MAX(ca.notes) as notes,
    CASE 
      WHEN MAX(CASE WHEN ca.role = 'doctor' THEN ca.staff_id END) IS NULL 
        OR MAX(CASE WHEN ca.role = 'dental_assistant' THEN ca.staff_id END) IS NULL 
      THEN 'no_staff'
      WHEN MAX(ca.is_visiting::int) > 0 THEN 'visiting'
      ELSE 'present'
    END as status
  FROM clinic_assignments ca
  GROUP BY ca.clinic_id, ca.clinic_name;
END;
$$ LANGUAGE plpgsql;
```

### Triggers

#### Update `updated_at` timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shift_assignments_updated_at BEFORE UPDATE ON shift_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. Supabase Best Practices

### 3.1 Row Level Security (RLS)

#### Enable RLS on all tables
```sql
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_working_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE unapproved_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

#### RLS Policies

**Admin Access (Full CRUD)**
```sql
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for all tables
CREATE POLICY "Admins have full access to clinics"
  ON clinics FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full access to staff"
  ON staff FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full access to staff_working_days"
  ON staff_working_days FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full access to leave_requests"
  ON leave_requests FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full access to shift_assignments"
  ON shift_assignments FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full access to unapproved_absences"
  ON unapproved_absences FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (is_admin());
```

**Staff Access (Limited - for future staff UI)**
```sql
-- Staff can view their own data
CREATE POLICY "Staff can view their own record"
  ON staff FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Staff can submit leave requests
CREATE POLICY "Staff can create their own leave requests"
  ON leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (staff_id IN (
    SELECT id FROM staff WHERE email = auth.jwt() ->> 'email'
  ));

CREATE POLICY "Staff can view their own leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (staff_id IN (
    SELECT id FROM staff WHERE email = auth.jwt() ->> 'email'
  ));
```

### 3.2 Database Optimization

#### Partitioning (for future scale)
```sql
-- Partition shift_assignments by month for better query performance
CREATE TABLE shift_assignments_template (
  LIKE shift_assignments INCLUDING ALL
) PARTITION BY RANGE (shift_date);

-- Create partitions for each month (automate this)
CREATE TABLE shift_assignments_2025_01 PARTITION OF shift_assignments_template
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

#### Materialized Views (for reporting)
```sql
-- Materialized view for quick staff availability
CREATE MATERIALIZED VIEW staff_availability_summary AS
SELECT 
  s.id,
  s.name,
  s.role,
  s.primary_clinic_id,
  COUNT(DISTINCT sa.shift_date) as days_assigned_this_month,
  COUNT(DISTINCT lr.id) FILTER (WHERE lr.status = 'approved') as approved_leaves_this_month
FROM staff s
LEFT JOIN shift_assignments sa ON s.id = sa.staff_id 
  AND sa.shift_date >= date_trunc('month', CURRENT_DATE)
  AND sa.shift_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
LEFT JOIN leave_requests lr ON s.id = lr.staff_id 
  AND lr.start_date >= date_trunc('month', CURRENT_DATE)
  AND lr.status = 'approved'
WHERE s.is_active = true
GROUP BY s.id, s.name, s.role, s.primary_clinic_id;

-- Refresh daily via cron
CREATE INDEX idx_staff_availability_summary ON staff_availability_summary(id);
```

### 3.3 Real-time Subscriptions

Enable real-time on critical tables:
```sql
-- Enable real-time replication
ALTER PUBLICATION supabase_realtime ADD TABLE shift_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE staff;
```

### 3.4 Database Migrations

Use Supabase CLI for version-controlled migrations:
```bash
# Initialize Supabase project
supabase init

# Create migration
supabase migration new initial_schema

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.types.ts
```

### 3.5 Connection Pooling

Configure in Supabase dashboard:
- **Transaction Mode**: For short-lived connections (default)
- **Session Mode**: For applications that need prepared statements
- Pool size: Start with 15, scale based on usage

### 3.6 Backups

- Enable Point-in-Time Recovery (PITR) in production
- Automated daily backups
- Retention: 7 days minimum, 30 days recommended

---

## 4. Project Structure

```
shift-manager/
├── public/
├── src/
│   ├── assets/
│   │   └── icons/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Layout.tsx
│   │   ├── shifts/
│   │   │   ├── ClinicCard.tsx
│   │   │   ├── StaffCard.tsx
│   │   │   ├── DateNavigator.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── ShiftEditor.tsx
│   │   │   └── StaffAssignmentModal.tsx
│   │   ├── staff/
│   │   │   ├── StaffList.tsx
│   │   │   ├── StaffForm.tsx
│   │   │   ├── StaffDetails.tsx
│   │   │   └── WorkingDaysSelector.tsx
│   │   └── leave/
│   │       ├── LeaveRequestList.tsx
│   │       ├── LeaveRequestCard.tsx
│   │       ├── LeaveApprovalModal.tsx
│   │       └── LeaveCalendar.tsx
│   ├── hooks/
│   │   ├── useShifts.ts
│   │   ├── useStaff.ts
│   │   ├── useLeaveRequests.ts
│   │   ├── useClinics.ts
│   │   ├── useAuth.ts
│   │   └── useRealtime.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── DailyShifts.tsx
│   │   ├── StaffManagement.tsx
│   │   ├── LeaveManagement.tsx
│   │   └── Login.tsx
│   ├── services/
│   │   ├── shifts.service.ts
│   │   ├── staff.service.ts
│   │   ├── leave.service.ts
│   │   ├── clinics.service.ts
│   │   └── auto-populate.service.ts
│   ├── types/
│   │   ├── database.types.ts (generated)
│   │   ├── models.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── date.utils.ts
│   │   ├── validation.schemas.ts
│   │   └── constants.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.local
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 5. API Layer

### 5.1 Supabase Client Setup

**`src/lib/supabase.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'shift-manager'
    }
  }
});
```

### 5.2 Service Layer Pattern

**`src/services/shifts.service.ts`**
```typescript
import { supabase } from '@/lib/supabase';
import { addDays, startOfDay } from 'date-fns';
import type { ShiftAssignment, ClinicRoster } from '@/types/models';

export class ShiftsService {
  /**
   * Get roster for a specific date
   */
  static async getRosterForDate(date: Date): Promise<ClinicRoster[]> {
    const { data, error } = await supabase
      .rpc('get_clinic_roster_for_date', {
        p_date: startOfDay(date).toISOString().split('T')[0]
      });

    if (error) throw error;
    return data;
  }

  /**
   * Get all assigned staff for a date
   */
  static async getAssignedStaffForDate(date: Date) {
    const { data, error } = await supabase
      .from('shift_assignments')
      .select(`
        *,
        staff:staff_id (
          id,
          name,
          role,
          primary_clinic_id
        ),
        clinic:clinic_id (
          id,
          name,
          location
        )
      `)
      .eq('shift_date', startOfDay(date).toISOString().split('T')[0]);

    if (error) throw error;
    return data;
  }

  /**
   * Get unassigned staff for a date
   */
  static async getUnassignedStaffForDate(date: Date) {
    const dateStr = startOfDay(date).toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    const { data, error } = await supabase
      .from('staff')
      .select(`
        *,
        primary_clinic:primary_clinic_id (
          id,
          name,
          location
        )
      `)
      .eq('is_active', true)
      .not('id', 'in', `(
        SELECT staff_id FROM shift_assignments WHERE shift_date = '${dateStr}'
      )`);

    if (error) throw error;
    return data;
  }

  /**
   * Assign staff to a clinic for a specific date
   */
  static async assignStaff(
    clinicId: string,
    staffId: string,
    date: Date,
    notes?: string
  ) {
    // Check if staff is assigned to their primary clinic
    const { data: staff } = await supabase
      .from('staff')
      .select('primary_clinic_id')
      .eq('id', staffId)
      .single();

    const isVisiting = staff?.primary_clinic_id !== clinicId;

    const { data, error } = await supabase
      .from('shift_assignments')
      .upsert({
        clinic_id: clinicId,
        staff_id: staffId,
        shift_date: startOfDay(date).toISOString().split('T')[0],
        is_visiting: isVisiting,
        notes: notes || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove staff assignment
   */
  static async removeAssignment(
    clinicId: string,
    staffId: string,
    date: Date
  ) {
    const { error } = await supabase
      .from('shift_assignments')
      .delete()
      .match({
        clinic_id: clinicId,
        staff_id: staffId,
        shift_date: startOfDay(date).toISOString().split('T')[0]
      });

    if (error) throw error;
  }

  /**
   * Update assignment notes
   */
  static async updateAssignmentNotes(
    assignmentId: string,
    notes: string
  ) {
    const { data, error } = await supabase
      .from('shift_assignments')
      .update({ notes })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

**`src/services/auto-populate.service.ts`**
```typescript
import { supabase } from '@/lib/supabase';
import { startOfDay, eachDayOfInterval, addDays } from 'date-fns';

export class AutoPopulateService {
  /**
   * Auto-populate shifts for a date range
   * Uses standard working days, excludes approved leaves,
   * ensures minimum staffing per clinic
   */
  static async autoPopulateShifts(
    startDate: Date,
    endDate: Date
  ): Promise<{ success: boolean; message: string }> {
    try {
      const dates = eachDayOfInterval({ start: startDate, end: endDate });

      for (const date of dates) {
        await this.populateSingleDay(date);
      }

      return {
        success: true,
        message: `Successfully populated shifts from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
      };
    } catch (error) {
      console.error('Auto-populate error:', error);
      return {
        success: false,
        message: 'Failed to auto-populate shifts'
      };
    }
  }

  /**
   * Populate shifts for a single day
   */
  private static async populateSingleDay(date: Date) {
    const dateStr = startOfDay(date).toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    // Get all active clinics
    const { data: clinics } = await supabase
      .from('clinics')
      .select('id')
      .eq('is_active', true);

    if (!clinics) return;

    // Get available staff (not on leave, not on weekly off, working this day)
    const { data: availableStaff } = await supabase
      .from('staff')
      .select(`
        id,
        role,
        primary_clinic_id,
        weekly_off_day,
        staff_working_days!inner(day_of_week, is_working)
      `)
      .eq('is_active', true)
      .neq('weekly_off_day', dayOfWeek)
      .eq('staff_working_days.day_of_week', dayOfWeek)
      .eq('staff_working_days.is_working', true)
      .not('id', 'in', `(
        SELECT staff_id FROM leave_requests 
        WHERE status = 'approved' 
        AND '${dateStr}' BETWEEN start_date AND end_date
      )`);

    if (!availableStaff) return;

    // Assign staff to their primary clinics first
    for (const staff of availableStaff) {
      // Check if already assigned
      const { data: existing } = await supabase
        .from('shift_assignments')
        .select('id')
        .eq('staff_id', staff.id)
        .eq('shift_date', dateStr)
        .single();

      if (existing) continue;

      // Assign to primary clinic
      await supabase
        .from('shift_assignments')
        .insert({
          clinic_id: staff.primary_clinic_id,
          staff_id: staff.id,
          shift_date: dateStr,
          is_visiting: false
        });
    }

    // Check for clinics with insufficient staff and balance
    for (const clinic of clinics) {
      await this.ensureMinimumStaffing(clinic.id, dateStr, availableStaff);
    }
  }

  /**
   * Ensure each clinic has at least 1 doctor and 1 DA
   */
  private static async ensureMinimumStaffing(
    clinicId: string,
    dateStr: string,
    availableStaff: any[]
  ) {
    // Check current assignments
    const { data: assignments } = await supabase
      .from('shift_assignments')
      .select('staff_id, staff:staff_id(role)')
      .eq('clinic_id', clinicId)
      .eq('shift_date', dateStr);

    const hasDoctor = assignments?.some(a => a.staff?.role === 'doctor');
    const hasDA = assignments?.some(a => a.staff?.role === 'dental_assistant');

    // Assign doctor if missing
    if (!hasDoctor) {
      const availableDoctor = availableStaff.find(
        s => s.role === 'doctor' && 
        !assignments?.some(a => a.staff_id === s.id)
      );

      if (availableDoctor) {
        await supabase.from('shift_assignments').insert({
          clinic_id: clinicId,
          staff_id: availableDoctor.id,
          shift_date: dateStr,
          is_visiting: availableDoctor.primary_clinic_id !== clinicId
        });
      }
    }

    // Assign DA if missing
    if (!hasDA) {
      const availableDA = availableStaff.find(
        s => s.role === 'dental_assistant' && 
        !assignments?.some(a => a.staff_id === s.id)
      );

      if (availableDA) {
        await supabase.from('shift_assignments').insert({
          clinic_id: clinicId,
          staff_id: availableDA.id,
          shift_date: dateStr,
          is_visiting: availableDA.primary_clinic_id !== clinicId
        });
      }
    }
  }
}
```

---

## 6. State Management

### 6.1 React Query Setup

**`src/lib/queryClient.ts`**
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1
    }
  }
});
```

### 6.2 Custom Hooks

**`src/hooks/useShifts.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShiftsService } from '@/services/shifts.service';
import { startOfDay } from 'date-fns';

export const useRosterForDate = (date: Date) => {
  return useQuery({
    queryKey: ['roster', startOfDay(date).toISOString()],
    queryFn: () => ShiftsService.getRosterForDate(date),
    staleTime: 1000 * 60 * 2 // 2 minutes
  });
};

export const useAssignedStaff = (date: Date) => {
  return useQuery({
    queryKey: ['assigned-staff', startOfDay(date).toISOString()],
    queryFn: () => ShiftsService.getAssignedStaffForDate(date)
  });
};

export const useUnassignedStaff = (date: Date) => {
  return useQuery({
    queryKey: ['unassigned-staff', startOfDay(date).toISOString()],
    queryFn: () => ShiftsService.getUnassignedStaffForDate(date)
  });
};

export const useAssignStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      staffId,
      date,
      notes
    }: {
      clinicId: string;
      staffId: string;
      date: Date;
      notes?: string;
    }) => ShiftsService.assignStaff(clinicId, staffId, date, notes),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['roster', startOfDay(variables.date).toISOString()]
      });
      queryClient.invalidateQueries({
        queryKey: ['assigned-staff', startOfDay(variables.date).toISOString()]
      });
      queryClient.invalidateQueries({
        queryKey: ['unassigned-staff', startOfDay(variables.date).toISOString()]
      });
    }
  });
};

export const useRemoveAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      staffId,
      date
    }: {
      clinicId: string;
      staffId: string;
      date: Date;
    }) => ShiftsService.removeAssignment(clinicId, staffId, date),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['roster', startOfDay(variables.date).toISOString()]
      });
      queryClient.invalidateQueries({
        queryKey: ['assigned-staff', startOfDay(variables.date).toISOString()]
      });
      queryClient.invalidateQueries({
        queryKey: ['unassigned-staff', startOfDay(variables.date).toISOString()]
      });
    }
  });
};
```

### 6.3 Real-time Updates

**`src/hooks/useRealtime.ts`**
```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimeShifts = (date: Date) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const dateStr = date.toISOString().split('T')[0];
    
    const channel: RealtimeChannel = supabase
      .channel(`shifts:${dateStr}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shift_assignments',
          filter: `shift_date=eq.${dateStr}`
        },
        (payload) => {
          console.log('Shift update received:', payload);
          
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({
            queryKey: ['roster', date.toISOString()]
          });
          queryClient.invalidateQueries({
            queryKey: ['assigned-staff', date.toISOString()]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date, queryClient]);
};
```

---

## 7. Feature Implementation

### 7.1 Daily Shifts View

**`src/pages/DailyShifts.tsx`**
```typescript
import React, { useState } from 'react';
import { DateNavigator } from '@/components/shifts/DateNavigator';
import { FilterPanel } from '@/components/shifts/FilterPanel';
import { ClinicCard } from '@/components/shifts/ClinicCard';
import { StaffCard } from '@/components/shifts/StaffCard';
import { useRosterForDate, useUnassignedStaff } from '@/hooks/useShifts';
import { useRealtimeShifts } from '@/hooks/useRealtime';

export const DailyShifts: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterClinic, setFilterClinic] = useState<string | null>(null);

  const { data: roster, isLoading: isLoadingRoster } = useRosterForDate(selectedDate);
  const { data: unassignedStaff, isLoading: isLoadingUnassigned } = useUnassignedStaff(selectedDate);

  // Enable real-time updates
  useRealtimeShifts(selectedDate);

  const filteredRoster = filterClinic
    ? roster?.filter(r => r.clinic_id === filterClinic)
    : roster;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      
      <FilterPanel
        filterClinic={filterClinic}
        onFilterChange={setFilterClinic}
      />

      <div className="px-4 py-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide px-1">
          Clinic Roster
        </h2>

        {isLoadingRoster ? (
          <div>Loading roster...</div>
        ) : (
          filteredRoster?.map(clinic => (
            <ClinicCard
              key={clinic.clinic_id}
              clinic={clinic}
              date={selectedDate}
            />
          ))
        )}

        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide px-1 mt-8">
          Other Staff
        </h2>

        {isLoadingUnassigned ? (
          <div>Loading staff...</div>
        ) : (
          unassignedStaff?.map(staff => (
            <StaffCard
              key={staff.id}
              staff={staff}
              date={selectedDate}
            />
          ))
        )}
      </div>
    </div>
  );
};
```

### 7.2 Staff Management

**`src/pages/StaffManagement.tsx`**
```typescript
import React, { useState } from 'react';
import { StaffList } from '@/components/staff/StaffList';
import { StaffForm } from '@/components/staff/StaffForm';
import { useStaff } from '@/hooks/useStaff';
import { Plus } from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const { data: staff, isLoading } = useStaff();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Staff Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        {isLoading ? (
          <div>Loading staff...</div>
        ) : (
          <StaffList
            staff={staff}
            onEdit={(s) => {
              setEditingStaff(s);
              setShowForm(true);
            }}
          />
        )}
      </div>

      {showForm && (
        <StaffForm
          staff={editingStaff}
          onClose={() => {
            setShowForm(false);
            setEditingStaff(null);
          }}
        />
      )}
    </div>
  );
};
```

### 7.3 Leave Management

**`src/pages/LeaveManagement.tsx`**
```typescript
import React, { useState } from 'react';
import { LeaveRequestList } from '@/components/leave/LeaveRequestList';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { Filter } from 'lucide-react';

type LeaveStatus = 'all' | 'pending' | 'approved' | 'rejected';

export const LeaveManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<LeaveStatus>('all');

  const { data: leaveRequests, isLoading } = useLeaveRequests(statusFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Leave Management</h1>
        </div>

        {/* Status Filter */}
        <div className="mb-4 flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as LeaveStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div>Loading leave requests...</div>
        ) : (
          <LeaveRequestList leaveRequests={leaveRequests} />
        )}
      </div>
    </div>
  );
};
```

---

## 8. Security & Performance

### 8.1 Environment Variables

**`.env.example`**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 8.2 Authentication

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .single();

    setIsAdmin(!!data);
  };

  return {
    user,
    isAdmin,
    loading,
    signIn: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut()
  };
};
```

### 8.3 Error Handling

```typescript
// src/lib/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleSupabaseError = (error: any): AppError => {
  if (error.code === 'PGRST116') {
    return new AppError('Resource not found', 'NOT_FOUND', 404);
  }

  if (error.code === '23505') {
    return new AppError('Record already exists', 'DUPLICATE', 409);
  }

  if (error.code === '23503') {
    return new AppError('Referenced record not found', 'FOREIGN_KEY', 400);
  }

  return new AppError(
    error.message || 'An unexpected error occurred',
    'UNKNOWN',
    500
  );
};
```

### 8.4 Performance Optimization

```typescript
// Lazy load routes
import { lazy, Suspense } from 'react';

const DailyShifts = lazy(() => import('@/pages/DailyShifts'));
const StaffManagement = lazy(() => import('@/pages/StaffManagement'));
const LeaveManagement = lazy(() => import('@/pages/LeaveManagement'));

// Use React.memo for expensive components
export const ClinicCard = React.memo(({ clinic, date }: ClinicCardProps) => {
  // Component logic
});

// Debounce search inputs
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 300);
```

---

## 9. Testing Strategy

### 9.1 Unit Tests (Vitest)

```typescript
// src/services/__tests__/shifts.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShiftsService } from '../shifts.service';

vi.mock('@/lib/supabase');

describe('ShiftsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get roster for a specific date', async () => {
    const date = new Date('2025-01-15');
    const roster = await ShiftsService.getRosterForDate(date);
    
    expect(roster).toBeDefined();
    expect(Array.isArray(roster)).toBe(true);
  });

  it('should assign staff with correct visiting status', async () => {
    const clinicId = 'clinic-1';
    const staffId = 'staff-1';
    const date = new Date('2025-01-15');

    const result = await ShiftsService.assignStaff(
      clinicId,
      staffId,
      date,
      'Test note'
    );

    expect(result).toBeDefined();
    expect(result.is_visiting).toBeDefined();
  });
});
```

### 9.2 Integration Tests

```typescript
// src/hooks/__tests__/useShifts.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useRosterForDate } from '../useShifts';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useRosterForDate', () => {
  it('should fetch roster data', async () => {
    const { result } = renderHook(
      () => useRosterForDate(new Date('2025-01-15')),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

### 9.3 E2E Tests (Playwright)

```typescript
// tests/daily-shifts.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Daily Shifts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Perform login
  });

  test('should display clinic roster', async ({ page }) => {
    await expect(page.locator('h2:has-text("Clinic Roster")')).toBeVisible();
    
    const clinicCards = page.locator('[data-testid="clinic-card"]');
    await expect(clinicCards).toHaveCount(3);
  });

  test('should navigate to next day', async ({ page }) => {
    const currentDate = await page.locator('[data-testid="current-date"]').textContent();
    
    await page.click('[data-testid="next-day-button"]');
    
    const newDate = await page.locator('[data-testid="current-date"]').textContent();
    expect(newDate).not.toBe(currentDate);
  });

  test('should assign staff to clinic', async ({ page }) => {
    await page.click('[data-testid="edit-assignment-clinic-1"]');
    await page.selectOption('[data-testid="staff-select"]', 'staff-1');
    await page.click('[data-testid="save-assignment"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });
});
```

---

## 10. Deployment Checklist

### 10.1 Pre-deployment

- [ ] Run all migrations on production database
- [ ] Enable RLS on all tables
- [ ] Configure connection pooling
- [ ] Set up database backups
- [ ] Configure CORS in Supabase dashboard
- [ ] Set up environment variables
- [ ] Build and test production bundle
- [ ] Run security audit (`npm audit`)
- [ ] Test on multiple devices/browsers

### 10.2 Monitoring

- [ ] Set up Supabase logs monitoring
- [ ] Configure alerts for database errors
- [ ] Monitor query performance
- [ ] Track API usage and rate limits
- [ ] Set up Sentry or similar for error tracking

### 10.3 Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90
- Bundle size: < 500KB (gzipped)

---

## 11. Future Enhancements

### Phase 2 Features
- PDF export of shift rosters
- Email notifications for leave approvals
- Bulk operations for shift assignments
- Analytics dashboard
- Mobile apps (React Native)
- WhatsApp integration for notifications
- Recurring shift templates
- Shift swap requests between staff

### Technical Improvements
- Implement Redis caching layer
- Add GraphQL API option
- Progressive Web App (PWA) support
- Offline-first architecture
- Advanced reporting with data warehouse

---

## Appendix A: Type Definitions

```typescript
// src/types/models.ts
export interface Clinic {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'dental_assistant';
  primary_clinic_id: string | null;
  weekly_off_day: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShiftAssignment {
  id: string;
  clinic_id: string;
  staff_id: string;
  shift_date: string;
  is_visiting: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  leave_type: 'planned' | 'emergency';
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicRoster {
  clinic_id: string;
  clinic_name: string;
  doctor_id: string | null;
  doctor_name: string | null;
  da_id: string | null;
  da_name: string | null;
  notes: string | null;
  status: 'present' | 'visiting' | 'no_staff';
}

export type StaffStatus = 
  | 'present'
  | 'visiting'
  | 'weekly_off'
  | 'approved_leave'
  | 'unapproved_leave'
  | 'available';
```

---

**End of Technical Specification**