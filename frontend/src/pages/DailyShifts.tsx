import React, { useState, useMemo } from "react";
import { DateNavigator } from "../components/common/DateNavigator";
import { FilterPanel } from "../components/common/FilterPanel";
import { ClinicCard } from "../components/shifts/ClinicCard";
import { StaffCard } from "../components/shifts/StaffCard";
import {
  getRosterForDate,
  getUnassignedStaffForDate,
} from "../utils/rosterUtils";
import { clinics } from "../data/mockData";

export const DailyShifts: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 2)); // Oct 2, 2025
  const [filterClinic, setFilterClinic] = useState<string | null>(null);

  const roster = useMemo(() => getRosterForDate(selectedDate), [selectedDate]);
  const unassignedStaff = useMemo(
    () => getUnassignedStaffForDate(selectedDate),
    [selectedDate]
  );

  const filteredRoster = filterClinic
    ? roster.filter((r) => r.clinic.id === filterClinic)
    : roster;

  const handleEditAssignment = (
    clinicId: string,
    role: "doctor" | "dental_assistant"
  ) => {
    console.log("Edit assignment:", clinicId, role);
    // This would open a modal to assign staff
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <FilterPanel
        filterClinic={filterClinic}
        onFilterChange={setFilterClinic}
        clinics={clinics}
      />

      <div className="px-4 py-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide px-1">
          Clinic Roster
        </h2>

        <div className="space-y-3">
          {filteredRoster.map((rosterItem) => (
            <ClinicCard
              key={rosterItem.clinic.id}
              roster={rosterItem}
              onEdit={handleEditAssignment}
            />
          ))}
        </div>

        {unassignedStaff.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide px-1 mt-8 pt-4">
              Other Staff
            </h2>

            <div className="space-y-3">
              {unassignedStaff.map((staff) => (
                <StaffCard key={staff.id} staff={staff} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
