import React from "react";
import { Filter } from "lucide-react";

interface FilterPanelProps {
  filterClinic: string | null;
  onFilterChange: (clinicId: string | null) => void;
  clinics: Array<{ id: string; name: string }>;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filterClinic,
  onFilterChange,
  clinics,
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filter</span>
        <div className="flex gap-2 ml-2">
          <button
            onClick={() => onFilterChange(null)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterClinic === null
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            All
          </button>
          {clinics.map((clinic) => (
            <button
              key={clinic.id}
              onClick={() => onFilterChange(clinic.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterClinic === clinic.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              {clinic.name}
            </button>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};
