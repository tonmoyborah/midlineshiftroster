import type {
  Clinic,
  Staff,
  LeaveRequest,
  ShiftAssignment,
} from "../types/models";

// Mock Clinics
export const clinics: Clinic[] = [
  {
    id: "clinic-1",
    name: "Central Clinic",
    location: "Downtown",
    is_active: true,
  },
  {
    id: "clinic-2",
    name: "North Branch",
    location: "Northside",
    is_active: true,
  },
  {
    id: "clinic-3",
    name: "East Branch",
    location: "Eastwood",
    is_active: true,
  },
];

// Mock Staff
export const staff: Staff[] = [
  {
    id: "staff-1",
    email: "sarah.chen@clinic.com",
    name: "Dr. Sarah Chen",
    role: "doctor",
    primary_clinic_id: "clinic-1",
    weekly_off_day: 0, // Sunday
    is_active: true,
  },
  {
    id: "staff-2",
    email: "maya.patel@clinic.com",
    name: "Maya Patel",
    role: "dental_assistant",
    primary_clinic_id: "clinic-1",
    weekly_off_day: 0, // Sunday
    is_active: true,
  },
  {
    id: "staff-3",
    email: "james.wilson@clinic.com",
    name: "Dr. James Wilson",
    role: "doctor",
    primary_clinic_id: "clinic-2",
    weekly_off_day: 1, // Monday
    is_active: true,
  },
  {
    id: "staff-4",
    email: "lisa.brown@clinic.com",
    name: "Lisa Brown",
    role: "dental_assistant",
    primary_clinic_id: "clinic-2",
    weekly_off_day: 0, // Sunday
    is_active: false, // Not assigned today
  },
  {
    id: "staff-5",
    email: "emily.brooks@clinic.com",
    name: "Dr. Emily Brooks",
    role: "doctor",
    primary_clinic_id: "clinic-3",
    weekly_off_day: 2, // Tuesday
    is_active: true,
  },
  {
    id: "staff-6",
    email: "tom.harris@clinic.com",
    name: "Tom Harris",
    role: "dental_assistant",
    primary_clinic_id: "clinic-3",
    weekly_off_day: 0, // Sunday
    is_active: true,
  },
  {
    id: "staff-7",
    email: "michael.smith@clinic.com",
    name: "Dr. Michael Smith",
    role: "doctor",
    primary_clinic_id: "clinic-1",
    weekly_off_day: 3, // Wednesday
    is_active: true,
  },
  {
    id: "staff-8",
    email: "anna.lee@clinic.com",
    name: "Anna Lee",
    role: "dental_assistant",
    primary_clinic_id: "clinic-2",
    weekly_off_day: 5, // Friday
    is_active: true,
  },
  {
    id: "staff-9",
    email: "admin@clinic.com",
    name: "System Administrator",
    role: "admin",
    primary_clinic_id: null, // Admins don't have primary clinics
    weekly_off_day: null, // Admins don't have weekly off days
    is_active: true,
  },
  {
    id: "staff-10",
    email: "hr@clinic.com",
    name: "HR Manager",
    role: "admin",
    primary_clinic_id: null,
    weekly_off_day: null,
    is_active: true,
  },
];

// Mock Leave Requests
export const leaveRequests: LeaveRequest[] = [
  {
    id: "leave-1",
    staff_id: "staff-4",
    start_date: "2025-10-02",
    end_date: "2025-10-03",
    leave_type: "planned",
    reason: "Personal",
    status: "pending",
    notes: null,
    approved_by: null,
    approved_at: null,
    created_at: "2025-09-25T10:00:00Z",
    updated_at: "2025-09-25T10:00:00Z",
  },
  {
    id: "leave-2",
    staff_id: "staff-8",
    start_date: "2025-10-01",
    end_date: "2025-10-05",
    leave_type: "emergency",
    reason: "Family emergency",
    status: "approved",
    notes: "Approved by admin",
    approved_by: "admin-user-1",
    approved_at: "2025-09-28T14:30:00Z",
    created_at: "2025-09-26T09:00:00Z",
    updated_at: "2025-09-28T14:30:00Z",
  },
];

// Mock Shift Assignments for Oct 2, 2025 (Thu)
export const shiftAssignments: ShiftAssignment[] = [
  {
    id: "shift-1",
    clinic_id: "clinic-1",
    staff_id: "staff-1",
    shift_date: "2025-10-02",
    is_visiting: false,
    notes: null,
  },
  {
    id: "shift-2",
    clinic_id: "clinic-1",
    staff_id: "staff-2",
    shift_date: "2025-10-02",
    is_visiting: false,
    notes: null,
  },
  {
    id: "shift-3",
    clinic_id: "clinic-2",
    staff_id: "staff-3",
    shift_date: "2025-10-02",
    is_visiting: false,
    notes: null,
  },
  {
    id: "shift-4",
    clinic_id: "clinic-3",
    staff_id: "staff-5",
    shift_date: "2025-10-02",
    is_visiting: true,
    notes: "Covering for Dr. Brooks",
  },
  {
    id: "shift-5",
    clinic_id: "clinic-3",
    staff_id: "staff-6",
    shift_date: "2025-10-02",
    is_visiting: false,
    notes: null,
  },
];
