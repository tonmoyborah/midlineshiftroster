import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, AlertCircle, FileText, Users, ArrowLeft, Home, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { PublicLeaveService } from '../services/publicLeave.service';

interface FormData {
  staff_id: string;
  start_date: string;
  end_date: string;
  is_emergency: boolean;
  is_weekly_off: boolean;
  reason: string;
}

interface FormErrors {
  staff_id?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
}

export const StaffLeaveApplication: React.FC = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<{ id: string; name: string; role: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    staff_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    is_emergency: false,
    is_weekly_off: false,
    reason: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Load staff list on mount
  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoadingStaff(true);
    const staff = await PublicLeaveService.getActiveStaff();
    setStaffList(staff);
    setLoadingStaff(false);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.staff_id) {
      errors.staff_id = 'Please select your name';
    }

    if (!formData.start_date) {
      errors.start_date = 'Please select a start date';
    }

    if (!formData.end_date) {
      errors.end_date = 'Please select an end date';
    }

    if (formData.end_date < formData.start_date) {
      errors.end_date = 'End date cannot be before start date';
    }

    if (!formData.reason || formData.reason.trim().length < 10) {
      errors.reason = 'Please provide a reason (at least 10 characters)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const result = await PublicLeaveService.submitLeaveRequest({
      staff_id: formData.staff_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      leave_type: formData.is_emergency ? 'emergency' : 'planned',
      reason: formData.reason.trim(),
    });

    setLoading(false);

    if (result.success && result.reference_id) {
      setReferenceId(result.reference_id);
      setSubmitted(true);
    } else {
      setError(result.error || 'Failed to submit leave request. Please try again.');
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setReferenceId('');
    setError('');
    setFormData({
      staff_id: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      is_emergency: false,
      is_weekly_off: false,
      reason: '',
    });
    setFormErrors({});
  };

  const selectedStaff = staffList.find((s) => s.id === formData.staff_id);

  // Success screen
  if (submitted) {
    const personalLink = `${window.location.origin}/my-leaves/${formData.staff_id}`;
    
    const handleCopyLink = () => {
      navigator.clipboard.writeText(personalLink).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    };

    const handleViewStatus = () => {
      window.location.href = personalLink;
    };

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

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Leave Request Submitted!
              </h2>
              
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Your leave request has been sent to the admin for approval.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Reference Number</p>
              <p className="text-lg sm:text-xl font-mono font-bold text-blue-700 break-all">{referenceId}</p>
            </div>

            <div className="text-left bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 space-y-2 text-xs sm:text-sm">
              <p>
                <span className="font-medium text-gray-700">Staff:</span>{' '}
                <span className="text-gray-900">{selectedStaff?.name}</span>
              </p>
              <p>
                <span className="font-medium text-gray-700">Period:</span>{' '}
                <span className="text-gray-900">
                  {format(new Date(formData.start_date), 'MMM d, yyyy')} -{' '}
                  {format(new Date(formData.end_date), 'MMM d, yyyy')}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-700">Type:</span>{' '}
                <span className="text-gray-900">
                  {formData.is_emergency ? '🚨 Emergency' : '📅 Planned'}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-700">Status:</span>{' '}
                <span className="text-yellow-700 font-medium">⏳ Pending Approval</span>
              </p>
            </div>

            {/* Personal Link Section - Mobile Optimized */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                  <span className="text-lg">🔗</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 text-center sm:text-left">
                    Your Personal Status Page
                  </h3>
                  <p className="text-xs text-gray-600 mb-3 text-center sm:text-left">
                    Save this link to check your leave status anytime!
                  </p>
                  <div className="bg-white border border-purple-200 rounded-lg p-2 sm:p-3 mb-3">
                    <p className="text-[10px] sm:text-xs font-mono text-gray-700 break-all leading-relaxed">
                      {personalLink}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium touch-manipulation active:scale-95"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleViewStatus}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium touch-manipulation active:scale-95"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>View Status</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base touch-manipulation active:scale-95"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center space-x-2 text-gray-700 hover:text-gray-900 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Leave Request</h1>
              <p className="text-sm text-gray-600">Midline Shift Roster</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Fill out this form to request time off. Your request will be reviewed by the admin.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* Staff Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Select Your Name <span className="text-red-500">*</span>
            </label>
            {loadingStaff ? (
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : (
              <>
                <select
                  value={formData.staff_id}
                  onChange={(e) => {
                    setFormData({ ...formData, staff_id: e.target.value });
                    setFormErrors({ ...formErrors, staff_id: undefined });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    formErrors.staff_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Choose your name --</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role === 'doctor' ? 'Doctor' : 'Dental Assistant'})
                    </option>
                  ))}
                </select>
                {formErrors.staff_id && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.staff_id}</p>
                )}
              </>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => {
                  setFormData({ ...formData, start_date: e.target.value });
                  setFormErrors({ ...formErrors, start_date: undefined });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  formErrors.start_date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.start_date && (
                <p className="text-sm text-red-600 mt-1">{formErrors.start_date}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => {
                  setFormData({ ...formData, end_date: e.target.value });
                  setFormErrors({ ...formErrors, end_date: undefined });
                }}
                min={formData.start_date}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  formErrors.end_date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.end_date && (
                <p className="text-sm text-red-600 mt-1">{formErrors.end_date}</p>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_emergency}
                onChange={(e) =>
                  setFormData({ ...formData, is_emergency: e.target.checked })
                }
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  🚨 This is emergency leave
                </span>
                <p className="text-xs text-gray-600 mt-0.5">
                  Check this if you need urgent time off (illness, family emergency, etc.)
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_weekly_off}
                onChange={(e) =>
                  setFormData({ ...formData, is_weekly_off: e.target.checked })
                }
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  🔵 This is for my weekly off day
                </span>
                <p className="text-xs text-gray-600 mt-0.5">
                  Check this if you're requesting leave to use your regular weekly off
                </p>
              </div>
            </label>
          </div>

          {/* Reason */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              Reason for Leave <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => {
                setFormData({ ...formData, reason: e.target.value });
                setFormErrors({ ...formErrors, reason: undefined });
              }}
              rows={4}
              placeholder="Please provide a brief reason for your leave request..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none ${
                formErrors.reason ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {formErrors.reason && (
                <p className="text-sm text-red-600">{formErrors.reason}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.reason.length} characters (min. 10)
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || loadingStaff}
            className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit Leave Request
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Your request will be reviewed by the admin. You'll be notified once it's approved or
            rejected.
          </p>
        </form>
      </div>
    </div>
  );
};

