import { useState, useEffect, useCallback } from 'react';
import { LeaveService } from '../services/leave.service';
import type { LeaveRequest } from '../types/models';

export const useLeaveRequests = (statusFilter?: 'all' | 'pending' | 'approved' | 'rejected') => {
  const [data, setData] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let requests;
      if (statusFilter === 'all' || !statusFilter) {
        requests = await LeaveService.getAllLeaveRequests();
      } else {
        requests = await LeaveService.getLeaveRequestsByStatus(statusFilter);
      }
      setData(requests);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching leave requests:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  return { data, loading, error, refetch: fetchLeaveRequests };
};

export const useCreateLeaveRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createLeaveRequest = async (
    leaveRequest: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const newRequest = await LeaveService.createLeaveRequest(leaveRequest);
      return newRequest;
    } catch (err) {
      setError(err as Error);
      console.error('Error creating leave request:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createLeaveRequest, loading, error };
};

export const useApproveLeave = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const approveLeave = async (id: string, approvedBy: string | null, notes?: string) => {
    try {
      setLoading(true);
      setError(null);
      const approved = await LeaveService.approveLeaveRequest(id, approvedBy, notes);
      return approved;
    } catch (err) {
      setError(err as Error);
      console.error('Error approving leave:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { approveLeave, loading, error };
};

export const useRejectLeave = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const rejectLeave = async (id: string, rejectedBy: string | null, notes?: string) => {
    try {
      setLoading(true);
      setError(null);
      const rejected = await LeaveService.rejectLeaveRequest(id, rejectedBy, notes);
      return rejected;
    } catch (err) {
      setError(err as Error);
      console.error('Error rejecting leave:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { rejectLeave, loading, error };
};

export const useDeleteLeaveRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteLeaveRequest = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await LeaveService.deleteLeaveRequest(id);
      return true;
    } catch (err) {
      setError(err as Error);
      console.error('Error deleting leave request:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteLeaveRequest, loading, error };
};
