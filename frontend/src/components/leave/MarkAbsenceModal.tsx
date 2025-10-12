import React, { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { Staff } from '../../types/models';

interface MarkAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    staffId: string;
    absenceDate: string;
    reason: 'no_show' | 'rejected_leave';
    notes: string;
  }) => Promise<void>;
  staff: Staff[];
  loading: boolean;
}

export const MarkAbsenceModal: React.FC<MarkAbsenceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  staff,
  loading,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [absenceDate, setAbsenceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reason, setReason] = useState<'no_show' | 'rejected_leave'>('no_show');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStaffId) {
      alert('Please select a staff member');
      return;
    }

    await onSubmit({
      staffId: selectedStaffId,
      absenceDate,
      reason,
      notes,
    });

    // Reset form
    setSelectedStaffId('');
    setAbsenceDate(format(new Date(), 'yyyy-MM-dd'));
    setReason('no_show');
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">Mark Unapproved Absence</h2>
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

          {/* Absence Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Absence Date *
            </label>
            <input
              type="date"
              value={absenceDate}
              onChange={(e) => setAbsenceDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as 'no_show' | 'rejected_leave')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="no_show">No Show (Unannounced Absence)</option>
              <option value="rejected_leave">Rejected Leave Follow-up</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes *
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe the circumstances of the absence"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This will mark the staff member as having an unapproved
              absence for the selected date. This is separate from leave requests and is used
              for tracking no-shows or other unplanned absences.
            </p>
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
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Marking...' : 'Mark Absence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

