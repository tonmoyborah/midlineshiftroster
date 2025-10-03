import { useState, useEffect, useCallback } from "react";
import { ClinicsService } from "../services/clinics.service";
import type { Clinic } from "../types/models";

export const useClinics = () => {
  const [data, setData] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClinics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const clinics = await ClinicsService.getAllClinics();
      setData(clinics);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching clinics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  return { data, loading, error, refetch: fetchClinics };
};

