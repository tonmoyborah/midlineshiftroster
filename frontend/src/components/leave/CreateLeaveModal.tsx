import React, { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { Staff } from '../../types/models';

interface CreateLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    staffId: string;
    startDate: string;
    endDate: string;
    status: 'pending' | 'approved';
    leaveType: 'planned' | 'emergency';
    reason: string;
    notes: string;
  }) => Promise<void>;
  staff: Staff[];
  loading: boolean;
}

export const CreateLeaveModal: React.FC<CreateLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  staff,
  loading,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState<'pending' | 'approved'>('approved');
  const [leaveType, setLeaveType] = useState<'planned' | 'emergency'>('planned');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStaffId) {
      alert('Please select a staff member');
      return;
    }

    await onSubmit({
      staffId: selectedStaffId,
      startDate,
      endDate,
      status,
      leaveType,
      reason,
      notes,
    });

    // Reset form
    setSelectedStaffId('');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
    setStatus('approved');
    setLeaveType('planned');
    setReason('');
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">Create Leave</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Member *
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a staff member</option>
              {staff
                .filter((s) => s.role !== 'admin')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role === 'doctor' ? 'Doctor' : s.role === 'dental_assistant' ? 'Dental Assistant' : 'Admin'})
                  </option>
                ))}
            </select>
          </div>

          {/* Leave Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Status *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="approved"
                  checked={status === 'approved'}
                  onChange={(e) => setStatus(e.target.value as 'approved')}
                  className="mr-2"
                />
                <span className="text-sm">Approved</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={(e) => setStatus(e.target.value as 'pending')}
                  className="mr-2"
                />
                <span className="text-sm">Pending (Unapproved)</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type *
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as 'planned' | 'emergency')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="planned">Planned</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Family event, Medical appointment"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Additional notes or comments"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Leave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

