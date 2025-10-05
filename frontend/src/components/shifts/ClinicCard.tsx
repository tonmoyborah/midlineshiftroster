import React from 'react';
import { Edit2 } from 'lucide-react';
import type { ClinicRoster } from '../../types/models';
import { StatusBadge } from '../common/StatusBadge';

interface ClinicCardProps {
  roster: ClinicRoster;
  onEdit?: (clinicId: string, role: 'doctor' | 'dental_assistant') => void;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ roster, onEdit }) => {
  const { clinic, doctors, dental_assistants, status } = roster;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{clinic.name}</h3>
          <p className="text-sm text-gray-500">{clinic.location}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Doctors Section */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Doctors
            </p>
            <p className="text-base font-semibold text-gray-900">
              {doctors && doctors.length > 0 ? (
                doctors.map((doc) => doc.name).join(', ')
              ) : (
                <span className="text-gray-400 italic">Not assigned</span>
              )}
            </p>
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(clinic.id, 'doctor')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Manage doctor assignments"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Dental Assistants Section */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Dental Assistants
            </p>
            <p className="text-base font-semibold text-gray-900">
              {dental_assistants && dental_assistants.length > 0 ? (
                dental_assistants.map((da) => da.name).join(', ')
              ) : (
                <span className="text-gray-400 italic">Not assigned</span>
              )}
            </p>
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(clinic.id, 'dental_assistant')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Manage dental assistant assignments"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
