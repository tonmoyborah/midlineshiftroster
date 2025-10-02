import React from "react";
import { Edit2 } from "lucide-react";
import type { ClinicRoster } from "../../types/models";
import { StatusBadge } from "../common/StatusBadge";

interface ClinicCardProps {
  roster: ClinicRoster;
  onEdit?: (clinicId: string, role: "doctor" | "dental_assistant") => void;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ roster, onEdit }) => {
  const { clinic, doctor, dental_assistant, status } = roster;

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

      {/* Doctor Section */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Doctor
            </p>
            <p className="text-base font-semibold text-gray-900">
              {doctor ? (
                doctor.name
              ) : (
                <span className="text-gray-400 italic">Not assigned</span>
              )}
            </p>
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(clinic.id, "doctor")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Edit doctor assignment">
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Dental Assistant Section */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Dental Assistant
            </p>
            <p className="text-base font-semibold text-gray-900">
              {dental_assistant ? (
                dental_assistant.name
              ) : (
                <span className="text-gray-400 italic">Not assigned</span>
              )}
            </p>
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(clinic.id, "dental_assistant")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Edit dental assistant assignment">
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
