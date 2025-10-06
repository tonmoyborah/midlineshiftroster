import { clinics, staff, shiftAssignments, leaveRequests } from '../data/mockData';
import type { ClinicRoster, StaffWithStatus, StaffStatus } from '../types/models';
import { formatDateISO, getDayOfWeek } from './dateUtils';

export const getRosterForDate = (date: Date): ClinicRoster[] => {
  const dateStr = formatDateISO(date);

  return clinics.map((clinic) => {
    const clinicAssignments = shiftAssignments.filter(
      (sa) => sa.clinic_id === clinic.id && sa.shift_date === dateStr,
    );

    // Get all doctors assigned to this clinic
    const doctors = clinicAssignments
      .filter((sa) => {
        const staffMember = staff.find((s) => s.id === sa.staff_id);
        return staffMember?.role === 'doctor';
      })
      .map((sa) => {
        const staffMember = staff.find((s) => s.id === sa.staff_id);
        // If assigned, they are either present or visiting
        const status: StaffStatus = sa.is_visiting ? 'visiting' : 'present';
        return {
          id: sa.staff_id,
          name: staffMember?.name || 'Unknown',
          status: status,
          is_visiting: sa.is_visiting,
        };
      });

    // Get all dental assistants assigned to this clinic
    const dental_assistants = clinicAssignments
      .filter((sa) => {
        const staffMember = staff.find((s) => s.id === sa.staff_id);
        return staffMember?.role === 'dental_assistant';
      })
      .map((sa) => {
        const staffMember = staff.find((s) => s.id === sa.staff_id);
        // If assigned, they are either present or visiting
        const status: StaffStatus = sa.is_visiting ? 'visiting' : 'present';
        return {
          id: sa.staff_id,
          name: staffMember?.name || 'Unknown',
          status: status,
          is_visiting: sa.is_visiting,
        };
      });

    return {
      clinic,
      doctors,
      dental_assistants,
      notes: clinicAssignments.find((sa) => sa.notes)?.notes || null,
    };
  });
};

export const getStaffStatus = (staffId: string, date: Date): StaffStatus => {
  const dateStr = formatDateISO(date);
  const dayOfWeek = getDayOfWeek(date);
  const staffMember = staff.find((s) => s.id === staffId);

  if (!staffMember) return 'unapproved_leave'; // Staff not found = unapproved absence

  // Check if assigned to any clinic first
  const assignment = shiftAssignments.find(
    (sa) => sa.staff_id === staffId && sa.shift_date === dateStr,
  );

  if (assignment) {
    // If assigned, they are either present or visiting (not on leave)
    return assignment.is_visiting ? 'visiting' : 'present';
  }

  // If not assigned, check leave statuses
  // Check weekly off
  if (staffMember.weekly_off_day === dayOfWeek) {
    return 'weekly_off';
  }

  // Check approved leave
  const hasApprovedLeave = leaveRequests.some(
    (lr) =>
      lr.staff_id === staffId &&
      lr.status === 'approved' &&
      dateStr >= lr.start_date &&
      dateStr <= lr.end_date,
  );

  if (hasApprovedLeave) {
    return 'approved_leave';
  }

  // Check unapproved leave (pending)
  const hasUnapprovedLeave = leaveRequests.some(
    (lr) =>
      lr.staff_id === staffId &&
      lr.status === 'pending' &&
      dateStr >= lr.start_date &&
      dateStr <= lr.end_date,
  );

  if (hasUnapprovedLeave) {
    return 'unapproved_leave';
  }

  return 'unapproved_leave'; // Not assigned and no leave = unapproved absence
};

export const getUnassignedStaffForDate = (date: Date): StaffWithStatus[] => {
  const dateStr = formatDateISO(date);
  const assignedStaffIds = shiftAssignments
    .filter((sa) => sa.shift_date === dateStr)
    .map((sa) => sa.staff_id);

  return staff
    .filter((s) => !assignedStaffIds.includes(s.id) && s.is_active)
    .map((s) => ({
      ...s,
      status: getStaffStatus(s.id, date),
    }));
};
