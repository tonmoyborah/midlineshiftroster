import React from "react";
import type { StaffWithStatus } from "../../types/models";
import { StatusBadge } from "../common/StatusBadge";

interface StaffCardProps {
  staff: StaffWithStatus;
}

export const StaffCard: React.FC<StaffCardProps> = ({ staff }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-0.5">
            {staff.role === "doctor" ? "Doctor" : "Dental Assistant"}
          </p>
          <p className="text-base font-semibold text-gray-900">{staff.name}</p>
          {staff.notes && (
            <p className="text-sm text-gray-600 mt-1">{staff.notes}</p>
          )}
        </div>
        <StatusBadge status={staff.status} />
      </div>
    </div>
  );
};
