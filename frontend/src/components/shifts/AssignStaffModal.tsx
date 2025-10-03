import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Staff, Clinic } from '../../types/models';

interface AssignStaffModalProps {
  clinic: Clinic | null;
  role: 'doctor' | 'dental_assistant' | null;
  currentStaffId?: string;
  availableStaff: Staff[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (staffId: string, notes?: string) => Promise<void>;
  isLoading: boolean;
}

export const AssignStaffModal: React.FC<AssignStaffModalProps> = ({
  clinic,
  role,
  currentStaffId,
  availableStaff,
  isOpen,
  onClose,
  onAssign,
  isLoading,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedStaffId(currentStaffId || '');
      setNotes('');
    }
  }, [isOpen, currentStaffId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStaffId) {
      alert('Please select a staff member');
      return;
    }

    try {
      await onAssign(selectedStaffId, notes || undefined);
      onClose();
    } catch (error) {
      console.error('Error assigning staff:', error);
    }
  };

  if (!isOpen || !clinic || !role) return null;

  // Filter staff by role - show ALL staff of that role
  const filteredStaff = availableStaff.filter((s) => s.role === role && s.is_active);

  // Debug logging
  console.log('AssignStaffModal Debug:', {
    clinic: clinic.name,
    role,
    currentStaffId,
    totalAvailableStaff: availableStaff.length,
    filteredStaffCount: filteredStaff.length,
    filteredStaff: filteredStaff.map((s) => ({ id: s.id, name: s.name, role: s.role })),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Assign {role === 'doctor' ? 'Doctor' : 'Dental Assistant'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {clinic.name} - {clinic.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {role === 'doctor' ? 'Doctor' : 'Dental Assistant'} *
            </label>
            {filteredStaff.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No available {role === 'doctor' ? 'doctors' : 'dental assistants'}</p>
                <p className="text-sm mt-1">All staff may be assigned or on leave</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredStaff.map((staffMember) => (
                  <label
                    key={staffMember.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStaffId === staffMember.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="staff"
                      value={staffMember.id}
                      checked={selectedStaffId === staffMember.id}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{staffMember.name}</p>
                      <p className="text-sm text-gray-500">{staffMember.email}</p>
                    </div>
                    {staffMember.primary_clinic_id !== clinic.id && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        Visiting
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={3}
              placeholder="e.g., Covering for colleague, Late arrival..."
              disabled={isLoading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || filteredStaff.length === 0}
            >
              {isLoading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
