import { supabase } from "../lib/supabase";
import type { LeaveRequest } from "../types/models";

export class LeaveService {
  /**
   * Get all leave requests
   */
  static async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from("leave_requests")
      .select(
        `
        *,
        staff:staff_id (
          id,
          name,
          role,
          email
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leave requests:", error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get leave requests by status
   */
  static async getLeaveRequestsByStatus(
    status: "pending" | "approved" | "rejected"
  ): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from("leave_requests")
      .select(
        `
        *,
        staff:staff_id (
          id,
          name,
          role,
          email
        )
      `
      )
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leave requests:", error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get leave requests for a specific staff member
   */
  static async getLeaveRequestsByStaff(
    staffId: string
  ): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from("leave_requests")
      .select("*")
      .eq("staff_id", staffId)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching staff leave requests:", error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a new leave request
   */
  static async createLeaveRequest(
    leaveRequest: Omit<LeaveRequest, "id" | "created_at" | "updated_at">
  ): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from("leave_requests")
      .insert(leaveRequest)
      .select()
      .single();

    if (error) {
      console.error("Error creating leave request:", error);
      throw error;
    }

    return data;
  }

  /**
   * Update leave request
   */
  static async updateLeaveRequest(
    id: string,
    updates: Partial<
      Omit<LeaveRequest, "id" | "staff_id" | "created_at" | "updated_at">
    >
  ): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from("leave_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating leave request:", error);
      throw error;
    }

    return data;
  }

  /**
   * Approve leave request
   */
  static async approveLeaveRequest(
    id: string,
    approvedBy: string,
    notes?: string
  ): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from("leave_requests")
      .update({
        status: "approved",
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error approving leave request:", error);
      throw error;
    }

    return data;
  }

  /**
   * Reject leave request
   */
  static async rejectLeaveRequest(
    id: string,
    rejectedBy: string,
    notes?: string
  ): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from("leave_requests")
      .update({
        status: "rejected",
        approved_by: rejectedBy,
        approved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error rejecting leave request:", error);
      throw error;
    }

    return data;
  }

  /**
   * Delete leave request
   */
  static async deleteLeaveRequest(id: string): Promise<void> {
    const { error } = await supabase.from("leave_requests").delete().eq("id", id);

    if (error) {
      console.error("Error deleting leave request:", error);
      throw error;
    }
  }

  /**
   * Check if staff has approved leave for a date range
   */
  static async hasApprovedLeave(
    staffId: string,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("leave_requests")
      .select("id")
      .eq("staff_id", staffId)
      .eq("status", "approved")
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (error) {
      console.error("Error checking leave:", error);
      return false;
    }

    return (data?.length || 0) > 0;
  }
}

