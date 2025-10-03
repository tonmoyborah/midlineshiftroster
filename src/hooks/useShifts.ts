import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShiftsService } from '@/services/shifts.service';
import { startOfDay } from 'date-fns';

export const useRosterForDate = (date: Date) => {
  return useQuery({
    queryKey: ['roster', startOfDay(date).toISOString()],
    queryFn: () => ShiftsService.getRosterForDate(date),
    staleTime: 1000 * 60 * 2,
  });
};

export const useAssignedStaff = (date: Date) => {
  return useQuery({
    queryKey: ['assigned-staff', startOfDay(date).toISOString()],
    queryFn: () => ShiftsService.getAssignedStaffForDate(date),
  });
};

export const useUnassignedStaff = (date: Date) => {
  return useQuery({
    queryKey: ['unassigned-staff', startOfDay(date).toISOString()],
    queryFn: () => ShiftsService.getUnassignedStaffForDate(date),
  });
};

export const useAssignStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      staffId,
      date,
      notes,
    }: {
      clinicId: string;
      staffId: string;
      date: Date;
      notes?: string;
    }) => ShiftsService.assignStaff(clinicId, staffId, date, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['roster', startOfDay(variables.date).toISOString()],
      });
      queryClient.invalidateQueries({
        queryKey: ['assigned-staff', startOfDay(variables.date).toISOString()],
      });
      queryClient.invalidateQueries({
        queryKey: ['unassigned-staff', startOfDay(variables.date).toISOString()],
      });
    },
  });
};

export const useRemoveAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clinicId, staffId, date }: { clinicId: string; staffId: string; date: Date }) =>
      ShiftsService.removeAssignment(clinicId, staffId, date),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['roster', startOfDay(variables.date).toISOString()],
      });
      queryClient.invalidateQueries({
        queryKey: ['assigned-staff', startOfDay(variables.date).toISOString()],
      });
      queryClient.invalidateQueries({
        queryKey: ['unassigned-staff', startOfDay(variables.date).toISOString()],
      });
    },
  });
};
