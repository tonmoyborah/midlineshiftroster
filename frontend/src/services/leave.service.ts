import { supabase } from '../lib/supabase';
import type { LeaveRequest } from '../types/models';

export class LeaveService {
  /**
   * Get all leave requests
   */
  static async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(
        `
        *,
        staff:staff_id (
          id,
          name,
          role,
          email
        )
      `,
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get leave requests by status
   */
  static async getLeaveRequestsByStatus(
    status: 'pending' | 'approved' | 'rejected',
  ): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(
        `
        *,
        staff:staff_id (
          id,
          name,
          role,
          email
        )
      `,
      )
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get leave requests for a specific staff member
   */
  static async getLeaveRequestsByStaff(staffId: string): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('staff_id', staffId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching staff leave requests:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a new leave request
   */
  static async createLeaveRequest(
    leaveRequest: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(leaveRequest)
      .select()
      .single();

    if (error) {
      console.error('Error creating leave request:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update leave request
   */
  static async updateLeaveRequest(
    id: string,
    updates: Partial<Omit<LeaveRequest, 'id' | 'staff_id' | 'created_at' | 'updated_at'>>,
  ): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating leave request:', error);
      throw error;
    }

    return data;
  }

  /**
   * Approve leave request
   */
  static async approveLeaveRequest(
    id: string,
    approvedBy: string | null,
    notes?: string,
  ): Promise<LeaveRequest> {
    console.log('Approving leave request with ID:', id);
    console.log('Approved by:', approvedBy);
    console.log('Notes:', notes);
    
    // First, check if the leave request exists
    const { data: existingRequest, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching leave request:', fetchError);
      throw new Error(`Leave request with ID ${id} not found`);
    }
    
    console.log('Found existing leave request:', existingRequest);
    
    const updateData = {
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      notes: notes || null,
    };
    
    console.log('Update data:', updateData);
    
    // Try the update without .single() first to see if it works
    const { data, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error approving leave request:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No rows were updated. This might be a permissions issue.');
    }

    console.log('Successfully approved leave request:', data[0]);
    return data[0];
  }

  /**
   * Reject leave request
   */
  static async rejectLeaveRequest(
    id: string,
    rejectedBy: string | null,
    notes?: string,
  ): Promise<LeaveRequest> {
    console.log('Rejecting leave request with ID:', id);
    console.log('Rejected by:', rejectedBy);
    console.log('Notes:', notes);
    
    // First, check if the leave request exists
    const { data: existingRequest, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching leave request:', fetchError);
      throw new Error(`Leave request with ID ${id} not found`);
    }
    
    console.log('Found existing leave request:', existingRequest);
    
    const updateData = {
      status: 'rejected',
      approved_by: rejectedBy, // Using approved_by field for both approval and rejection
      approved_at: new Date().toISOString(), // Using approved_at for both approval and rejection
      notes: notes || null,
    };
    
    console.log('Update data:', updateData);
    
    // Try the update without .single() first to see if it works
    const { data, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error rejecting leave request:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No rows were updated. This might be a permissions issue.');
    }

    console.log('Successfully rejected leave request:', data[0]);
    return data[0];
  }

  /**
   * Delete leave request
   */
  static async deleteLeaveRequest(id: string): Promise<void> {
    const { error } = await supabase.from('leave_requests').delete().eq('id', id);

    if (error) {
      console.error('Error deleting leave request:', error);
      throw error;
    }
  }

  /**
   * Check if staff has approved leave for a date range
   */
  static async hasApprovedLeave(
    staffId: string,
    startDate: string,
    endDate: string,
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('id')
      .eq('staff_id', staffId)
      .eq('status', 'approved')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (error) {
      console.error('Error checking leave:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  }

  /**
   * Create a manual leave request (admin creates on behalf of staff)
   * Can create approved, pending, or rejected leaves
   */
  static async createManualLeave(
    staffId: string,
    startDate: string,
    endDate: string,
    status: 'pending' | 'approved' | 'rejected',
    leaveType: 'planned' | 'emergency',
    reason: string,
    notes: string | null,
    createdBy: string | null,
  ): Promise<LeaveRequest> {
    const leaveData: any = {
      staff_id: staffId,
      start_date: startDate,
      end_date: endDate,
      status: status,
      leave_type: leaveType,
      reason: reason,
      notes: notes,
    };

    // If creating as approved, set approved_by and approved_at
    if (status === 'approved' && createdBy) {
      leaveData.approved_by = createdBy;
      leaveData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert(leaveData)
      .select()
      .single();

    if (error) {
      console.error('Error creating manual leave:', error);
      throw error;
    }

    return data;
  }

  /**
   * Mark staff as having unapproved absence for a specific date
   * Uses the unapproved_absences table
   */
  static async markUnapprovedAbsence(
    staffId: string,
    absenceDate: string,
    reason: 'no_show' | 'rejected_leave',
    notes: string | null,
    markedBy: string,
  ): Promise<any> {
    const { data, error } = await supabase
      .from('unapproved_absences')
      .insert({
        staff_id: staffId,
        absence_date: absenceDate,
        reason: reason,
        notes: notes,
        marked_by: markedBy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error marking unapproved absence:', error);
      throw error;
    }

    return data;
  }

  /**
   * Remove unapproved absence marking
   */
  static async removeUnapprovedAbsence(staffId: string, absenceDate: string): Promise<void> {
    const { error } = await supabase
      .from('unapproved_absences')
      .delete()
      .eq('staff_id', staffId)
      .eq('absence_date', absenceDate);

    if (error) {
      console.error('Error removing unapproved absence:', error);
      throw error;
    }
  }

  /**
   * Get all unapproved absences for a specific date range
   */
  static async getUnapprovedAbsences(startDate?: string, endDate?: string): Promise<any[]> {
    let query = supabase
      .from('unapproved_absences')
      .select(
        `
        *,
        staff:staff_id (
          id,
          name,
          role,
          email
        )
      `,
      )
      .order('absence_date', { ascending: false });

    if (startDate) {
      query = query.gte('absence_date', startDate);
    }
    if (endDate) {
      query = query.lte('absence_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching unapproved absences:', error);
      throw error;
    }

    return data || [];
  }
}
