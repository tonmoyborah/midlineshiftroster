import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, XCircle, AlertCircle, Plus, Copy, Check, Home } from 'lucide-react';
import { format } from 'date-fns';
import { PublicLeaveService } from '../services/publicLeave.service';

interface LeaveRequest {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  leave_type: 'planned' | 'emergency';
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const MyLeaves: React.FC = () => {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [staffName, setStaffName] = useState<string>('');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (staffId) {
      loadLeaveRequests();
    }
  }, [staffId]);

  const loadLeaveRequests = async () => {
    if (!staffId) return;

    setLoading(true);
    setError('');

    const result = await PublicLeaveService.getLeaveRequestsByStaffId(staffId);

    if (result.success && result.data) {
      setLeaveRequests(result.data);
      setStaffName(result.staffName || 'Staff Member');
    } else {
      setError(result.error || 'Failed to load leave requests');
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  };

  const handleNewRequest = () => {
    navigate('/staff-leave-request');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 px-4">Loading your leave requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-md">
          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            className="mb-3 sm:mb-4 flex items-center space-x-2 text-gray-700 hover:text-gray-900 bg-white/80 backdrop-blur-sm px-3 py-2 sm:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">Back to Home</span>
          </button>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Access Error</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/staff-leave-request')}
              className="w-full px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base touch-manipulation active:scale-95"
            >
              Submit New Leave Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-3 sm:mb-4 flex items-center space-x-2 text-gray-700 hover:text-gray-900 bg-white/80 backdrop-blur-sm px-3 py-2 sm:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Header - Mobile Optimized */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Title and Icon Section */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">My Leave Requests</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{staffName}</p>
              </div>
            </div>
            
            {/* New Request Button - Full width on mobile */}
            <button
              onClick={handleNewRequest}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium touch-manipulation active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Request</span>
            </button>
          </div>

          {/* Copy URL Section - Mobile Optimized */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
              📌 Bookmark This Page
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 mb-3">
              This is your personal page. Save this link to check your leave status anytime.
            </p>
            
            {/* URL and Copy Button - Stack on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded text-[10px] sm:text-xs font-mono text-gray-700 min-w-0"
              />
              <button
                onClick={handleCopyUrl}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium touch-manipulation active:scale-95 flex-shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Leave Requests List */}
        {leaveRequests.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Leave Requests Yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
              You haven't submitted any leave requests. Click the button below to submit your first
              request.
            </p>
            <button
              onClick={handleNewRequest}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base touch-manipulation active:scale-95"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Submit Leave Request</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 px-1">
              All Requests ({leaveRequests.length})
            </h2>
            {leaveRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
              >
                {/* Status and Type - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        <span>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {request.leave_type === 'planned' ? '📅 Planned' : '🚨 Emergency'}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Submitted {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Leave Period</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 break-words">
                        {format(new Date(request.start_date), 'MMM d, yyyy')} -{' '}
                        {format(new Date(request.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    {request.approved_at && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          {request.status === 'approved' ? 'Approved On' : 'Rejected On'}
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900">
                          {format(new Date(request.approved_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    )}
                  </div>

                  {request.reason && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Your Reason</p>
                      <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 rounded-lg p-2.5 sm:p-3 break-words">
                        {request.reason}
                      </p>
                    </div>
                  )}

                  {request.notes && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Admin Notes</p>
                      <p className="text-xs sm:text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3 break-words">
                        💬 {request.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer - Mobile Optimized */}
        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={() => navigate('/staff-leave-request')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-white/60"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Submit Another Leave Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};

