import { supabase } from '../lib/supabase';

/**
 * Public Leave Service
 * Handles leave request submissions from the public-facing staff form
 * No authentication required - uses anonymous access with RLS policies
 */
export class PublicLeaveService {
  /**
   * Submit a leave request from the public form
   * Creates a leave request with status='pending' for admin approval
   */
  static async submitLeaveRequest(data: {
    staff_id: string;
    start_date: string;
    end_date: string;
    leave_type: 'planned' | 'emergency';
    reason: string;
  }): Promise<{ success: boolean; reference_id?: string; error?: string }> {
    try {
      // Validate dates
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (endDate < startDate) {
        return {
          success: false,
          error: 'End date cannot be before start date',
        };
      }

      // Insert leave request with pending status
      const { data: leaveRequest, error } = await supabase
        .from('leave_requests')
        .insert({
          staff_id: data.staff_id,
          start_date: data.start_date,
          end_date: data.end_date,
          leave_type: data.leave_type,
          reason: data.reason,
          status: 'pending',
          notes: null,
          approved_by: null,
          approved_at: null,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error submitting leave request:', error);
        return {
          success: false,
          error: error.message || 'Failed to submit leave request',
        };
      }

      // Generate a friendly reference ID
      const referenceId = `LR-${new Date().getFullYear()}-${leaveRequest.id.slice(0, 8).toUpperCase()}`;

      return {
        success: true,
        reference_id: referenceId,
      };
    } catch (error: any) {
      console.error('Unexpected error submitting leave request:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Get list of active staff members for the dropdown
   * Only returns basic info (id, name, role) - no sensitive data
   */
  static async getActiveStaff(): Promise<
    { id: string; name: string; role: string }[]
  > {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, role')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching active staff:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching staff:', error);
      return [];
    }
  }

  /**
   * Validate if a staff member exists and is active
   */
  static async validateStaffId(staffId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id')
        .eq('id', staffId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating staff ID:', error);
      return false;
    }
  }

  /**
   * Get all leave requests for a specific staff member (by staff ID)
   * Used for personal leave status page
   */
  static async getLeaveRequestsByStaffId(
    staffId: string
  ): Promise<{
    success: boolean;
    data?: any[];
    staffName?: string;
    error?: string;
  }> {
    try {
      // First verify staff exists and get their name
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, name, role')
        .eq('id', staffId)
        .eq('is_active', true)
        .single();

      if (staffError || !staffData) {
        return {
          success: false,
          error: 'Staff member not found or inactive',
        };
      }

      // Fetch all leave requests for this staff member
      const { data: requests, error: requestsError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching leave requests:', requestsError);
        return {
          success: false,
          error: 'Failed to fetch leave requests',
        };
      }

      return {
        success: true,
        data: requests || [],
        staffName: staffData.name,
      };
    } catch (error: any) {
      console.error('Unexpected error fetching leave requests:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }
}

