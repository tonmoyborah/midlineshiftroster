import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DateNavigator } from '../components/common/DateNavigator';
import { FilterPanel } from '../components/common/FilterPanel';
import { ClinicCard } from '../components/shifts/ClinicCard';
import { StaffCard } from '../components/shifts/StaffCard';
import { ManageStaffModal } from '../components/shifts/ManageStaffModal';
import {
  useRosterForDate,
  useUnassignedStaff,
  useAssignStaff,
  useRemoveAssignment,
  useAutoAssignStaff,
} from '../hooks/useShifts';
import { useClinics } from '../hooks/useClinics';
import { useStaff } from '../hooks/useStaff';
import type { Clinic } from '../types/models';

export const DailyShifts: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 2)); // Oct 2, 2025
  const [filterClinic, setFilterClinic] = useState<string | null>(null);

  // Modal state
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [managingClinic, setManagingClinic] = useState<Clinic | null>(null);
  const [managingRole, setManagingRole] = useState<'doctor' | 'dental_assistant' | null>(null);

  const {
    data: roster,
    loading: rosterLoading,
    error: rosterError,
    refetch: refetchRoster,
  } = useRosterForDate(selectedDate);

  const {
    data: unassignedStaff,
    loading: unassignedLoading,
    error: unassignedError,
    refetch: refetchUnassigned,
  } = useUnassignedStaff(selectedDate);

  const { data: clinics, loading: clinicsLoading } = useClinics();
  const { data: allStaff, loading: staffLoading } = useStaff();
  const { assignStaff, loading: assigning } = useAssignStaff();
  const { removeAssignment, loading: removing } = useRemoveAssignment();
  const { autoAssign } = useAutoAssignStaff();

  const filteredRoster = filterClinic ? roster.filter((r) => r.clinic.id === filterClinic) : roster;

  // Auto-assign staff when page loads or date changes
  useEffect(() => {
    const autoAssignIfNeeded = async () => {
      // Wait for initial roster load
      if (rosterLoading) return;

      // Check if any clinics have staff assigned
      const hasAssignments = roster.some(
        (r) => r.doctors.length > 0 || r.dental_assistants.length > 0,
      );

      // Only auto-assign if no assignments exist for this date
      if (!hasAssignments && roster.length > 0) {
        console.log('No assignments found. Auto-assigning staff...');
        const result = await autoAssign(selectedDate);

        if (result) {
          console.log(
            `✅ Auto-assigned ${result.assigned_count} staff, skipped ${result.skipped_count}`,
          );
          // Refresh data
          await refetchRoster();
          await refetchUnassigned();
        }
      }
    };

    autoAssignIfNeeded();
  }, [selectedDate, rosterLoading, roster.length]); // Run when date changes or roster loads

  // Debug logging for staff data
  console.log('DailyShifts Debug:', {
    selectedDate: format(selectedDate, 'yyyy-MM-dd'),
    allStaffCount: allStaff?.length || 0,
    staffLoading,
    unassignedStaffCount: unassignedStaff?.length || 0,
    unassignedLoading,
    unassignedError: unassignedError?.message,
    allStaff: allStaff?.map((s) => ({ id: s.id, name: s.name, role: s.role })),
    unassignedStaff: unassignedStaff?.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      status: s.status,
    })),
  });

  const handleManageStaff = (clinicId: string, role: 'doctor' | 'dental_assistant') => {
    const clinic = clinics.find((c) => c.id === clinicId);
    if (clinic) {
      setManagingClinic(clinic);
      setManagingRole(role);
      setIsManageModalOpen(true);
    }
  };

  const handleAddStaff = async (staffId: string) => {
    if (!managingClinic) return;

    const success = await assignStaff(managingClinic.id, staffId, selectedDate);

    if (success) {
      // Refresh data
      await refetchRoster();
      await refetchUnassigned();
    } else {
      alert('Failed to add staff. Please try again.');
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    if (!managingClinic) return;

    const success = await removeAssignment(managingClinic.id, staffId, selectedDate);

    if (success) {
      // Refresh data
      await refetchRoster();
      await refetchUnassigned();
    } else {
      alert('Failed to remove staff. Please try again.');
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Refresh data after changes
  const handleRefresh = () => {
    refetchRoster();
    refetchUnassigned();
  };

  return (
    <div className="min-h-screen bg-[#dcfce7]">
      <DateNavigator selectedDate={selectedDate} onDateChange={handleDateChange} />

      {!clinicsLoading && (
        <FilterPanel
          filterClinic={filterClinic}
          onFilterChange={setFilterClinic}
          clinics={clinics}
        />
      )}

      <div className="py-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide px-1">
          Clinic Roster
        </h2>

        {rosterError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading roster</p>
            <p className="text-sm">{rosterError.message}</p>
            <button onClick={handleRefresh} className="mt-2 text-sm font-medium underline">
              Try again
            </button>
          </div>
        )}

        {rosterLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 px-4 py-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRoster.map((rosterItem) => (
              <ClinicCard
                key={rosterItem.clinic.id}
                roster={rosterItem}
                onEdit={handleManageStaff}
              />
            ))}
          </div>
        )}

        {/* Other Staff Section - Always show unless initial load */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide px-1 mb-4">
            Other Staff
          </h2>

          {unassignedError && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm">Could not load unassigned staff: {unassignedError.message}</p>
              <button onClick={handleRefresh} className="mt-2 text-sm font-medium underline">
                Try again
              </button>
            </div>
          )}

          {unassignedLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 px-4 py-3 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : unassignedStaff.length > 0 ? (
            <div className="space-y-3">
              {unassignedStaff.map((staff) => (
                <StaffCard key={staff.id} staff={staff} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-6 text-center">
              <p className="text-gray-500">All staff members are currently assigned</p>
              <p className="text-sm text-gray-400 mt-1">
                Staff who are not assigned to clinics will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manage Staff Modal */}
      <ManageStaffModal
        clinic={managingClinic}
        role={managingRole}
        assignedStaff={
          managingClinic && managingRole
            ? roster.find((r) => r.clinic.id === managingClinic.id)?.[
                managingRole === 'doctor' ? 'doctors' : 'dental_assistants'
              ] || []
            : []
        }
        availableStaff={allStaff}
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false);
          setManagingClinic(null);
          setManagingRole(null);
        }}
        onAdd={handleAddStaff}
        onRemove={handleRemoveStaff}
        isLoading={assigning || removing}
      />
    </div>
  );
};
