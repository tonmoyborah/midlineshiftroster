import React from 'react';
import { MapPin } from 'lucide-react';
import type { StaffInRoster } from '../../types/models';
import { StatusBadge } from '../common/StatusBadge';

interface StaffRosterCardProps {
  staff: StaffInRoster;
  role: 'doctor' | 'dental_assistant';
}

export const StaffRosterCard: React.FC<StaffRosterCardProps> = ({ staff, role }) => {
  const roleLabel = role === 'doctor' ? 'Doctor' : 'Dental Assistant';
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {roleLabel}
          </p>
          {staff.is_visiting && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <MapPin className="w-3 h-3" />
              <span>Visiting</span>
            </div>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-900">{staff.name}</p>
      </div>
      <StatusBadge status={staff.status} />
    </div>
  );
};
