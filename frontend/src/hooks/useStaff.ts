import { useState, useEffect, useCallback } from "react";
import { StaffService } from "../services/staff.service";
import type { Staff } from "../types/models";

export const useStaff = () => {
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const staff = await StaffService.getAllStaff();
      setData(staff);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return { data, loading, error, refetch: fetchStaff };
};

export const useStaffById = (id: string) => {
  const [data, setData] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        const staff = await StaffService.getStaffById(id);
        setData(staff);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching staff:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaff();
    }
  }, [id]);

  return { data, loading, error };
};

export const useCreateStaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createStaff = async (
    staff: Omit<Staff, "id" | "created_at" | "updated_at">
  ) => {
    try {
      setLoading(true);
      setError(null);
      const newStaff = await StaffService.createStaff(staff);
      return newStaff;
    } catch (err) {
      setError(err as Error);
      console.error("Error creating staff:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createStaff, loading, error };
};

export const useUpdateStaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStaff = async (
    id: string,
    updates: Partial<Omit<Staff, "id" | "created_at" | "updated_at">>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updatedStaff = await StaffService.updateStaff(id, updates);
      return updatedStaff;
    } catch (err) {
      setError(err as Error);
      console.error("Error updating staff:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateStaff, loading, error };
};

export const useDeleteStaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteStaff = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await StaffService.deleteStaff(id);
      return true;
    } catch (err) {
      setError(err as Error);
      console.error("Error deleting staff:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteStaff, loading, error };
};

