import {
  clinics,
  staff,
  shiftAssignments,
  leaveRequests,
} from "../data/mockData";
import type { ClinicRoster, StaffWithStatus, StaffStatus } from "../types/models";
import { formatDateISO, getDayOfWeek } from "./dateUtils";

export const getRosterForDate = (date: Date): ClinicRoster[] => {
  const dateStr = formatDateISO(date);
  const dayOfWeek = getDayOfWeek(date);

  return clinics.map((clinic) => {
    const clinicAssignments = shiftAssignments.filter(
      (sa) => sa.clinic_id === clinic.id && sa.shift_date === dateStr
    );

    const doctorAssignment = clinicAssignments.find((sa) => {
      const staffMember = staff.find((s) => s.id === sa.staff_id);
      return staffMember?.role === "doctor";
    });

    const daAssignment = clinicAssignments.find((sa) => {
      const staffMember = staff.find((s) => s.id === sa.staff_id);
      return staffMember?.role === "dental_assistant";
    });

    const doctor = doctorAssignment
      ? staff.find((s) => s.id === doctorAssignment.staff_id) || null
      : null;

    const dental_assistant = daAssignment
      ? staff.find((s) => s.id === daAssignment.staff_id) || null
      : null;

    let status: "present" | "visiting" | "no_staff" = "no_staff";

    if (doctor || dental_assistant) {
      const hasVisiting =
        doctorAssignment?.is_visiting ||
        false ||
        daAssignment?.is_visiting ||
        false;
      status = hasVisiting ? "visiting" : "present";
    }

    if (!doctor || !dental_assistant) {
      status = "no_staff";
    }

    return {
      clinic,
      doctor,
      dental_assistant,
      status,
      notes: doctorAssignment?.notes || daAssignment?.notes || null,
    };
  });
};

export const getStaffStatus = (staffId: string, date: Date): StaffStatus => {
  const dateStr = formatDateISO(date);
  const dayOfWeek = getDayOfWeek(date);
  const staffMember = staff.find((s) => s.id === staffId);

  if (!staffMember) return "available";

  // Check weekly off
  if (staffMember.weekly_off_day === dayOfWeek) {
    return "weekly_off";
  }

  // Check approved leave
  const hasApprovedLeave = leaveRequests.some(
    (lr) =>
      lr.staff_id === staffId &&
      lr.status === "approved" &&
      dateStr >= lr.start_date &&
      dateStr <= lr.end_date
  );

  if (hasApprovedLeave) {
    return "approved_leave";
  }

  // Check unapproved leave (pending)
  const hasUnapprovedLeave = leaveRequests.some(
    (lr) =>
      lr.staff_id === staffId &&
      lr.status === "pending" &&
      dateStr >= lr.start_date &&
      dateStr <= lr.end_date
  );

  if (hasUnapprovedLeave) {
    return "unapproved_leave";
  }

  // Check if assigned
  const assignment = shiftAssignments.find(
    (sa) => sa.staff_id === staffId && sa.shift_date === dateStr
  );

  if (assignment) {
    return assignment.is_visiting ? "visiting" : "present";
  }

  return "available";
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
