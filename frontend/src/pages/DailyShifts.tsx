import { useState } from 'react';
import { format } from 'date-fns';
import { DateNavigator } from '../components/common/DateNavigator';
import { FilterPanel } from '../components/common/FilterPanel';
import { ClinicCard } from '../components/shifts/ClinicCard';
import { StaffCard } from '../components/shifts/StaffCard';
import { AssignStaffModal } from '../components/shifts/AssignStaffModal';
import { useRosterForDate, useUnassignedStaff, useAssignStaff } from '../hooks/useShifts';
import { useClinics } from '../hooks/useClinics';
import { useStaff } from '../hooks/useStaff';
import type { Clinic } from '../types/models';

export const DailyShifts: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 2)); // Oct 2, 2025
  const [filterClinic, setFilterClinic] = useState<string | null>(null);

  // Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningClinic, setAssigningClinic] = useState<Clinic | null>(null);
  const [assigningRole, setAssigningRole] = useState<'doctor' | 'dental_assistant' | null>(null);
  const [currentStaffId, setCurrentStaffId] = useState<string | undefined>(undefined);

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

  const filteredRoster = filterClinic ? roster.filter((r) => r.clinic.id === filterClinic) : roster;

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

  const handleEditAssignment = (clinicId: string, role: 'doctor' | 'dental_assistant') => {
    const clinic = clinics.find((c) => c.id === clinicId);
    if (clinic) {
      // Find the current roster entry for this clinic
      const clinicRoster = roster.find((r) => r.clinic.id === clinicId);

      // Get the currently assigned staff ID based on role
      const currentId =
        role === 'doctor' ? clinicRoster?.doctor?.id : clinicRoster?.dental_assistant?.id;

      setAssigningClinic(clinic);
      setAssigningRole(role);
      setCurrentStaffId(currentId);
      setIsAssignModalOpen(true);
    }
  };

  const handleAssignStaff = async (staffId: string, notes?: string) => {
    if (!assigningClinic) return;

    const success = await assignStaff(assigningClinic.id, staffId, selectedDate, notes);

    if (success) {
      // Refresh data
      await refetchRoster();
      await refetchUnassigned();
      setIsAssignModalOpen(false);
      setAssigningClinic(null);
      setAssigningRole(null);
    } else {
      alert('Failed to assign staff. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DateNavigator selectedDate={selectedDate} onDateChange={handleDateChange} />

      {!clinicsLoading && (
        <FilterPanel
          filterClinic={filterClinic}
          onFilterChange={setFilterClinic}
          clinics={clinics}
        />
      )}

      <div className="px-4 py-5 space-y-4">
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
                onEdit={handleEditAssignment}
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

      {/* Assign Staff Modal */}
      <AssignStaffModal
        clinic={assigningClinic}
        role={assigningRole}
        currentStaffId={currentStaffId}
        availableStaff={allStaff}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssigningClinic(null);
          setAssigningRole(null);
          setCurrentStaffId(undefined);
        }}
        onAssign={handleAssignStaff}
        isLoading={assigning}
      />
    </div>
  );
};
