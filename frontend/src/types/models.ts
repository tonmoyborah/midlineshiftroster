export interface Clinic {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
}

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'dental_assistant' | 'admin';
  primary_clinic_id: string | null;
  weekly_off_day: number | null; // 0=Sunday, 6=Saturday
  is_active: boolean;
}

export interface StaffWorkingDay {
  id: string;
  staff_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  is_working: boolean;
}

export interface LeaveRequest {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  leave_type: 'planned' | 'emergency';
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
}

export interface ShiftAssignment {
  id: string;
  clinic_id: string;
  staff_id: string;
  shift_date: string;
  is_visiting: boolean;
  notes: string | null;
}

export interface ClinicRoster {
  clinic: Clinic;
  doctors: Staff[]; // Changed from single to array
  dental_assistants: Staff[]; // Changed from single to array
  status: 'present' | 'visiting' | 'no_staff';
  notes: string | null;
}

export type StaffStatus =
  | 'present'
  | 'visiting'
  | 'weekly_off'
  | 'approved_leave'
  | 'unapproved_leave'
  | 'available';

export interface StaffWithStatus extends Staff {
  status: StaffStatus;
  assigned_clinic?: Clinic;
  notes?: string;
}
