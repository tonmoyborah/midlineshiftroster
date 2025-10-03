import { useState, useEffect, useCallback } from "react";
import { ShiftsService } from "../services/shifts.service";
import type { ClinicRoster, ShiftAssignment } from "../types/models";

export const useRosterForDate = (date: Date) => {
  const [data, setData] = useState<ClinicRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoster = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const roster = await ShiftsService.getRosterForDate(date);
      setData(roster);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching roster:", err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  return { data, loading, error, refetch: fetchRoster };
};

export const useShiftAssignments = (date: Date) => {
  const [data, setData] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const assignments = await ShiftsService.getShiftAssignmentsForDate(date);
      setData(assignments);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { data, loading, error, refetch: fetchAssignments };
};

export const useUnassignedStaff = (date: Date) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUnassigned = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const unassigned = await ShiftsService.getUnassignedStaffForDate(date);
      setData(unassigned);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching unassigned staff:", err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchUnassigned();
  }, [fetchUnassigned]);

  return { data, loading, error, refetch: fetchUnassigned };
};

export const useAssignStaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const assignStaff = async (
    clinicId: string,
    staffId: string,
    date: Date,
    notes?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      await ShiftsService.assignStaff(clinicId, staffId, date, notes);
      return true;
    } catch (err) {
      setError(err as Error);
      console.error("Error assigning staff:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { assignStaff, loading, error };
};

export const useRemoveAssignment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const removeAssignment = async (
    clinicId: string,
    staffId: string,
    date: Date
  ) => {
    try {
      setLoading(true);
      setError(null);
      await ShiftsService.removeAssignment(clinicId, staffId, date);
      return true;
    } catch (err) {
      setError(err as Error);
      console.error("Error removing assignment:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { removeAssignment, loading, error };
};

