import React, { useState } from 'react';
import { Calendar, Check, X, Clock, Plus, UserX } from 'lucide-react';
import { format } from 'date-fns';
import {
  useLeaveRequests,
  useApproveLeave,
  useRejectLeave,
  useCreateManualLeave,
  useMarkAbsence,
} from '../hooks/useLeave';
import { useAuthContext } from '../contexts/AuthContext';
import { useStaff } from '../hooks/useStaff';
import { CreateLeaveModal } from '../components/leave/CreateLeaveModal';
import { MarkAbsenceModal } from '../components/leave/MarkAbsenceModal';

type LeaveStatus = 'all' | 'pending' | 'approved' | 'rejected';

export const LeaveManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<LeaveStatus>('all');
  const [isCreateLeaveModalOpen, setIsCreateLeaveModalOpen] = useState(false);
  const [isMarkAbsenceModalOpen, setIsMarkAbsenceModalOpen] = useState(false);
  const { user } = useAuthContext();

  const { data: leaveRequests, loading, error, refetch } = useLeaveRequests(statusFilter);
  const { data: allStaff, loading: staffLoading } = useStaff();
  const { approveLeave, loading: approving } = useApproveLeave();
  const { rejectLeave, loading: rejecting } = useRejectLeave();
  const { createManualLeave, loading: creatingLeave } = useCreateManualLeave();
  const { markAbsence, loading: markingAbsence } = useMarkAbsence();

  const getStaffName = (request: any) => {
    // The staff info is populated via the join in the service
    return request.staff?.name || 'Unknown';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleApprove = async (id: string) => {
    console.log('Attempting to approve leave request with ID:', id);
    console.log('Current user:', user);
    console.log('User ID:', user?.id);
    
    const adminId = user?.id || null;
    console.log('Using admin ID:', adminId);
    
    try {
      const result = await approveLeave(id, adminId, 'Approved by admin');
      console.log('Approval result:', result);

      if (result) {
        refetch();
      }
    } catch (error) {
      console.error('Error in handleApprove:', error);
    }
  };

  const handleReject = async (id: string) => {
    console.log('Attempting to reject leave request with ID:', id);
    console.log('Current user:', user);
    console.log('User ID:', user?.id);
    
    const adminId = user?.id || null;
    console.log('Using admin ID:', adminId);
    
    try {
      const result = await rejectLeave(id, adminId, 'Rejected by admin');
      console.log('Rejection result:', result);

      if (result) {
        refetch();
      }
    } catch (error) {
      console.error('Error in handleReject:', error);
    }
  };

  const handleCreateLeave = async (data: {
    staffId: string;
    startDate: string;
    endDate: string;
    status: 'pending' | 'approved';
    leaveType: 'planned' | 'emergency';
    reason: string;
    notes: string;
  }) => {
    const result = await createManualLeave(
      data.staffId,
      data.startDate,
      data.endDate,
      data.status,
      data.leaveType,
      data.reason,
      data.notes,
      user?.id || null,
    );

    if (result) {
      console.log('Leave created successfully:', result);
      setIsCreateLeaveModalOpen(false);
      refetch();
    } else {
      alert('Failed to create leave. Please try again.');
    }
  };

  const handleMarkAbsence = async (data: {
    staffId: string;
    absenceDate: string;
    reason: 'no_show' | 'rejected_leave';
    notes: string;
  }) => {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    const result = await markAbsence(data.staffId, data.absenceDate, data.reason, data.notes, user.id);

    if (result) {
      console.log('Absence marked successfully:', result);
      setIsMarkAbsenceModalOpen(false);
      refetch();
    } else {
      alert('Failed to mark absence. Please try again.');
    }
  };

  console.log('Leave requests here:', leaveRequests);

  return (
    <div className="min-h-screen bg-[#dcfce7]">
      <div className="py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-gray-700" />
            <h1 className="text-xl font-semibold text-gray-900">Leave Management</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreateLeaveModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Leave
            </button>
            <button
              onClick={() => setIsMarkAbsenceModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <UserX className="w-4 h-4" />
              Mark Absence
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-4 flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as LeaveStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error loading leave requests</p>
            <p className="text-sm">{error.message}</p>
            <button onClick={refetch} className="mt-2 text-sm font-medium underline">
              Try again
            </button>
          </div>
        )}

        {/* Leave Requests */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 px-4 py-4 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaveRequests.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No leave requests found</p>
              </div>
            ) : (
              leaveRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl border border-gray-200 px-4 py-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {getStaffName(request)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            request.status,
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {request.leave_type === 'planned' ? '📅 Planned' : '🚨 Emergency'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Period:</span>{' '}
                      {format(new Date(request.start_date), 'MMM d, yyyy')} -{' '}
                      {format(new Date(request.end_date), 'MMM d, yyyy')}
                    </p>
                    {request.reason && (
                      <p>
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                    )}
                    {request.notes && (
                      <p>
                        <span className="font-medium">Notes:</span> {request.notes}
                      </p>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={approving}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approving ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={rejecting}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {rejecting ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Leave Modal */}
      <CreateLeaveModal
        isOpen={isCreateLeaveModalOpen}
        onClose={() => setIsCreateLeaveModalOpen(false)}
        onSubmit={handleCreateLeave}
        staff={allStaff || []}
        loading={creatingLeave}
      />

      {/* Mark Absence Modal */}
      <MarkAbsenceModal
        isOpen={isMarkAbsenceModalOpen}
        onClose={() => setIsMarkAbsenceModalOpen(false)}
        onSubmit={handleMarkAbsence}
        staff={allStaff || []}
        loading={markingAbsence}
      />
    </div>
  );
};
