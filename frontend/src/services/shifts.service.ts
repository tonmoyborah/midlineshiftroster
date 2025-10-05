import { supabase } from '../lib/supabase';
import type { ShiftAssignment, ClinicRoster } from '../types/models';
import { startOfDay, format } from 'date-fns';

export class ShiftsService {
  /**
   * Get roster for a specific date using the database function
   */
  static async getRosterForDate(date: Date): Promise<ClinicRoster[]> {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');

    const { data, error } = await supabase.rpc('get_clinic_roster_for_date', {
      p_date: dateStr,
    });

    console.log('Roster data:', data, '... ', error, dateStr);
    if (error) {
      console.error('Error fetching roster:', error);
      throw error;
    }

    // Transform the data to match our ClinicRoster type
    return (
      data?.map((row: any) => ({
        clinic: {
          id: row.clinic_id,
          name: row.clinic_name,
          location: row.clinic_location || '',
          is_active: true,
        },
        // Parse JSONB arrays from database
        doctors: Array.isArray(row.doctors)
          ? row.doctors.map((doc: any) => ({
              id: doc.id,
              name: doc.name,
              email: '',
              role: 'doctor' as const,
              primary_clinic_id: row.clinic_id,
              weekly_off_day: null,
              is_active: true,
            }))
          : [],
        dental_assistants: Array.isArray(row.dental_assistants)
          ? row.dental_assistants.map((da: any) => ({
              id: da.id,
              name: da.name,
              email: '',
              role: 'dental_assistant' as const,
              primary_clinic_id: row.clinic_id,
              weekly_off_day: null,
              is_active: true,
            }))
          : [],
        status: row.status,
        notes: row.notes,
      })) || []
    );
  }

  /**
   * Get all shift assignments for a specific date
   */
  static async getShiftAssignmentsForDate(date: Date): Promise<ShiftAssignment[]> {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('shift_assignments')
      .select(
        `
        *,
        staff:staff_id (
          id,
          name,
          role,
          email,
          primary_clinic_id
        ),
        clinic:clinic_id (
          id,
          name,
          location
        )
      `,
      )
      .eq('shift_date', dateStr);

    if (error) {
      console.error('Error fetching shift assignments:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get unassigned staff for a specific date
   */
  static async getUnassignedStaffForDate(date: Date) {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    // Get all active staff
    const { data: allStaff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('is_active', true);

    if (staffError) {
      console.error('Error fetching staff:', staffError);
      throw staffError;
    }

    // Get assigned staff for this date
    const { data: assignments, error: assignError } = await supabase
      .from('shift_assignments')
      .select('staff_id')
      .eq('shift_date', dateStr);

    if (assignError) {
      console.error('Error fetching assignments:', assignError);
      throw assignError;
    }

    const assignedStaffIds = new Set(assignments?.map((a) => a.staff_id) || []);

    // Filter out assigned staff
    const unassignedStaff = allStaff?.filter((staff) => !assignedStaffIds.has(staff.id));

    // Get status for each unassigned staff
    const staffWithStatus = await Promise.all(
      (unassignedStaff || []).map(async (staff) => {
        // Check weekly off
        if (staff.weekly_off_day === dayOfWeek) {
          return { ...staff, status: 'weekly_off' as const };
        }

        // Check approved leave
        // Query: Is dateStr BETWEEN start_date AND end_date?
        // This means: start_date <= dateStr <= end_date
        const { data: approvedLeave, error: approvedError } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('staff_id', staff.id)
          .eq('status', 'approved')
          .lte('start_date', dateStr) // start_date <= dateStr
          .gte('end_date', dateStr) // end_date >= dateStr
          .maybeSingle();

        console.log(`[${staff.name}] [${dateStr}] Approved leave check:`, {
          approvedLeave,
          approvedError,
          query: {
            staff_id: staff.id,
            status: 'approved',
            start_date_lte: dateStr,
            end_date_gte: dateStr,
          },
        });

        if (approvedLeave) {
          return { ...staff, status: 'approved_leave' as const };
        }

        // Check pending leave
        // Query: Is dateStr BETWEEN start_date AND end_date?
        const { data: pendingLeave, error: pendingError } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('staff_id', staff.id)
          .eq('status', 'pending')
          .lte('start_date', dateStr) // start_date <= dateStr
          .gte('end_date', dateStr) // end_date >= dateStr
          .maybeSingle();

        console.log(`[${staff.name}] [${dateStr}] Pending leave check:`, {
          pendingLeave,
          pendingError,
        });

        if (pendingLeave) {
          return { ...staff, status: 'unapproved_leave' as const };
        }

        return { ...staff, status: 'available' as const };
      }),
    );

    return staffWithStatus;
  }

  /**
   * Assign staff to a clinic for a specific date
   */
  static async assignStaff(
    clinicId: string,
    staffId: string,
    date: Date,
    notes?: string,
  ): Promise<ShiftAssignment> {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');

    // Check if staff is assigned to their primary clinic
    const { data: staff } = await supabase
      .from('staff')
      .select('primary_clinic_id')
      .eq('id', staffId)
      .single();

    const isVisiting = staff?.primary_clinic_id !== clinicId;

    const { data, error } = await supabase
      .from('shift_assignments')
      .upsert(
        {
          clinic_id: clinicId,
          staff_id: staffId,
          shift_date: dateStr,
          is_visiting: isVisiting,
          notes: notes || null,
        },
        {
          onConflict: 'clinic_id,staff_id,shift_date',
        },
      )
      .select()
      .single();

    if (error) {
      console.error('Error assigning staff:', error);
      throw error;
    }

    return data;
  }

  /**
   * Remove staff assignment
   */
  static async removeAssignment(clinicId: string, staffId: string, date: Date): Promise<void> {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');

    const { error } = await supabase.from('shift_assignments').delete().match({
      clinic_id: clinicId,
      staff_id: staffId,
      shift_date: dateStr,
    });

    if (error) {
      console.error('Error removing assignment:', error);
      throw error;
    }
  }

  /**
   * Update assignment notes
   */
  static async updateAssignmentNotes(
    assignmentId: string,
    notes: string,
  ): Promise<ShiftAssignment> {
    const { data, error } = await supabase
      .from('shift_assignments')
      .update({ notes })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating notes:', error);
      throw error;
    }

    return data;
  }

  /**
   * Auto-assign all available staff to their primary clinics for a specific date
   */
  static async autoAssignStaffToPrimaryClinics(date: Date): Promise<{
    assigned_count: number;
    skipped_count: number;
    message: string;
  }> {
    const dateStr = format(date, 'yyyy-MM-dd');

    const { data, error } = await supabase.rpc('auto_assign_staff_to_primary_clinics', {
      p_date: dateStr,
    });

    if (error) {
      console.error('Error auto-assigning staff:', error);
      throw error;
    }

    return data[0] || { assigned_count: 0, skipped_count: 0, message: 'No staff assigned' };
  }
}
