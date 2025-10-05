import { supabase } from '../lib/supabase';
import type { Staff } from '../types/models';
import { format } from 'date-fns';

export class StaffService {
  /**
   * Get all active staff with their primary clinic details
   */
  static async getAllStaff(): Promise<Staff[]> {
    const { data, error } = await supabase
      .from('staff')
      .select(
        `
        *,
        primary_clinic:primary_clinic_id (
          id,
          name,
          location
        )
      `,
      )
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get staff by ID
   */
  static async getStaffById(id: string): Promise<Staff | null> {
    const { data, error } = await supabase
      .from('staff')
      .select(
        `
        *,
        primary_clinic:primary_clinic_id (
          id,
          name,
          location
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get staff by role
   */
  static async getStaffByRole(role: 'doctor' | 'dental_assistant'): Promise<Staff[]> {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('role', role)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching staff by role:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create new staff member
   */
  static async createStaff(staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<Staff> {
    const { data, error } = await supabase.from('staff').insert(staff).select().single();

    if (error) {
      console.error('Error creating staff:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update staff member
   */
  static async updateStaff(
    id: string,
    updates: Partial<Omit<Staff, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating staff:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete staff (soft delete by setting is_active to false)
   */
  static async deleteStaff(id: string): Promise<void> {
    const { error } = await supabase.from('staff').update({ is_active: false }).eq('id', id);

    if (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  }

  /**
   * Get staff status for a specific date using DB function
   */
  static async getStaffStatusForDate(staffId: string, date: Date): Promise<string> {
    const dateStr = format(date, 'yyyy-MM-dd');

    const { data, error } = await supabase.rpc('get_staff_status_for_date', {
      p_staff_id: staffId,
      p_date: dateStr,
    });

    if (error) {
      console.error('Error fetching staff status:', error);
      throw error;
    }

    return data || 'available';
  }
}
