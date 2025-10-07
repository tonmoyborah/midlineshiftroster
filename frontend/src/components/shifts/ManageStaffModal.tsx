import React, { useState } from 'react';
import { X, Trash2, UserPlus } from 'lucide-react';
import type { Staff, Clinic, StaffInRoster } from '../../types/models';

interface ManageStaffModalProps {
  clinic: Clinic | null;
  role: 'doctor' | 'dental_assistant' | null;
  assignedStaff: StaffInRoster[] | Staff[]; // Currently assigned staff (accepts both types)
  availableStaff: Staff[]; // All available staff (filtered by status)
  isOpen: boolean;
  onClose: () => void;
  onAdd: (staffId: string) => Promise<void>;
  onRemove: (staffId: string) => Promise<void>;
  isLoading: boolean;
}

export const ManageStaffModal: React.FC<ManageStaffModalProps> = ({
  clinic,
  role,
  assignedStaff,
  availableStaff,
  isOpen,
  onClose,
  onAdd,
  onRemove,
  isLoading,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState('');

  if (!isOpen || !clinic || !role) return null;

  // Filter available staff by role and exclude already assigned staff
  const assignedIds = new Set(assignedStaff.map((s) => s.id));
  const unassignedStaff = availableStaff.filter(
    (s) => s.role === role && s.is_active && !assignedIds.has(s.id),
  );

  // Separate into default (primary clinic) and visiting staff
  const defaultStaff = unassignedStaff.filter((s) => s.primary_clinic_id === clinic.id);
  const visitingStaff = unassignedStaff.filter((s) => s.primary_clinic_id !== clinic.id);

  const handleAdd = async () => {
    if (!selectedStaffId) {
      alert('Please select a staff member');
      return;
    }

    try {
      await onAdd(selectedStaffId);
      setSelectedStaffId('');
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const handleRemove = async (staffId: string) => {
    try {
      await onRemove(staffId);
    } catch (error) {
      console.error('Error removing staff:', error);
    }
  };

  const roleLabel = role === 'doctor' ? 'Doctor' : 'Dental Assistant';
  const roleLabelPlural = role === 'doctor' ? 'Doctors' : 'Dental Assistants';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Manage {roleLabelPlural}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {clinic.name} - {clinic.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Currently Assigned Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Currently Assigned ({assignedStaff.length})
            </h3>
            {assignedStaff.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No {roleLabelPlural.toLowerCase()} assigned
              </p>
            ) : (
              <div className="space-y-2">
                {assignedStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900">{staff.name}</span>
                    <button
                      onClick={() => handleRemove(staff.id)}
                      disabled={isLoading}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                      aria-label={`Remove ${staff.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Add {roleLabel}</h3>
            {unassignedStaff.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No available {roleLabelPlural.toLowerCase()} to add
              </p>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  <option value="">Select a {roleLabel.toLowerCase()}...</option>

                  {/* Default Staff from this clinic */}
                  {defaultStaff.length > 0 && (
                    <optgroup label="Default Staff">
                      {defaultStaff.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {/* Visiting Staff from other clinics */}
                  {visitingStaff.length > 0 && (
                    <optgroup label="Visiting Staff">
                      {visitingStaff.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <button
                  onClick={handleAdd}
                  disabled={!selectedStaffId || isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  {isLoading ? 'Adding...' : `Add ${roleLabel}`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
