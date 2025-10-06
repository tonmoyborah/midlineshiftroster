import React from 'react';
import { Edit2, AlertTriangle } from 'lucide-react';
import type { ClinicRoster } from '../../types/models';
import { StaffRosterCard } from './StaffRosterCard';

interface ClinicCardProps {
  roster: ClinicRoster;
  onEdit?: (clinicId: string, role: 'doctor' | 'dental_assistant') => void;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ roster, onEdit }) => {
  const { clinic, doctors, dental_assistants } = roster;

  // Check if there's no doctor or no dental assistant
  const hasNoDoctor = doctors.length === 0;
  const hasNoDentalAssistant = dental_assistants.length === 0;
  const showWarning = hasNoDoctor || hasNoDentalAssistant;
  
  // Create warning message
  const getWarningMessage = () => {
    if (hasNoDoctor && hasNoDentalAssistant) {
      return "No doctors and no dental assistants assigned";
    } else if (hasNoDoctor) {
      return "No doctors assigned";
    } else if (hasNoDentalAssistant) {
      return "No dental assistants assigned";
    }
    return "";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{clinic.name}</h3>
              {showWarning && (
                <div title={getWarningMessage()}>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">{clinic.location}</p>
          </div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Doctors ({doctors.length})
          </p>
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
        {doctors.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No doctors assigned</p>
        ) : (
          <div className="space-y-2">
            {doctors.map((doctor) => (
              <StaffRosterCard
                key={doctor.id}
                staff={doctor}
                role="doctor"
              />
            ))}
          </div>
        )}
      </div>

      {/* Dental Assistants Section */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Dental Assistants ({dental_assistants.length})
          </p>
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
        {dental_assistants.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No dental assistants assigned</p>
        ) : (
          <div className="space-y-2">
            {dental_assistants.map((assistant) => (
              <StaffRosterCard
                key={assistant.id}
                staff={assistant}
                role="dental_assistant"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
