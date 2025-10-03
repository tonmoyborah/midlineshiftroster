import { supabase } from "../lib/supabase";
import type { Clinic } from "../types/models";

export class ClinicsService {
  /**
   * Get all active clinics
   */
  static async getAllClinics(): Promise<Clinic[]> {
    const { data, error } = await supabase
      .from("clinics")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching clinics:", error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get clinic by ID
   */
  static async getClinicById(id: string): Promise<Clinic | null> {
    const { data, error } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching clinic:", error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new clinic
   */
  static async createClinic(
    clinic: Omit<Clinic, "id" | "created_at" | "updated_at">
  ): Promise<Clinic> {
    const { data, error } = await supabase
      .from("clinics")
      .insert(clinic)
      .select()
      .single();

    if (error) {
      console.error("Error creating clinic:", error);
      throw error;
    }

    return data;
  }

  /**
   * Update clinic
   */
  static async updateClinic(
    id: string,
    updates: Partial<Omit<Clinic, "id" | "created_at" | "updated_at">>
  ): Promise<Clinic> {
    const { data, error } = await supabase
      .from("clinics")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating clinic:", error);
      throw error;
    }

    return data;
  }

  /**
   * Delete clinic (soft delete by setting is_active to false)
   */
  static async deleteClinic(id: string): Promise<void> {
    const { error } = await supabase
      .from("clinics")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Error deleting clinic:", error);
      throw error;
    }
  }
}

