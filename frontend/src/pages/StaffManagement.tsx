import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { useStaff, useCreateStaff, useUpdateStaff } from '../hooks/useStaff';
import { useClinics } from '../hooks/useClinics';
import { StaffFormModal } from '../components/staff/StaffFormModal';
import type { Staff } from '../types/models';

export const StaffManagement: React.FC = () => {
  const { data: staff, loading, error, refetch } = useStaff();
  const { data: clinics } = useClinics();
  const { createStaff, loading: creating } = useCreateStaff();
  const { updateStaff, loading: updating } = useUpdateStaff();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Separate staff by role
  const doctors = staff.filter((s) => s.role === 'doctor');
  const dentalAssistants = staff.filter((s) => s.role === 'dental_assistant');

  const getClinicName = (clinicId: string | null) => {
    if (!clinicId) return 'No primary clinic';
    const clinic = clinics.find((c) => c.id === clinicId);
    return clinic ? clinic.name : 'Unknown';
  };

  const getDayName = (day: number | null) => {
    if (day === null) return 'Not set';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSubmit = async (staffData: Partial<Staff>) => {
    try {
      if (editingStaff) {
        // Update existing staff
        const result = await updateStaff(editingStaff.id, staffData);
        if (result) {
          await refetch();
          alert('Staff member updated successfully!');
        }
      } else {
        // Create new staff
        const result = await createStaff(
          staffData as Omit<Staff, 'id' | 'created_at' | 'updated_at'>,
        );
        if (result) {
          await refetch();
          alert('Staff member created successfully!');
        }
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Something went wrong'}`);
    }
  };

  // Render a staff card
  const renderStaffCard = (staffMember: Staff) => (
    <div key={staffMember.id} className="bg-white rounded-xl border border-gray-200 px-4 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{staffMember.name}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                staffMember.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {staffMember.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Email:</span> {staffMember.email}
            </p>
            <p>
              <span className="font-medium">Primary Clinic:</span>{' '}
              {getClinicName(staffMember.primary_clinic_id)}
            </p>
            <p>
              <span className="font-medium">Weekly Off:</span>{' '}
              {getDayName(staffMember.weekly_off_day)}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleEditStaff(staffMember)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-gray-700" />
            <h1 className="text-xl font-semibold text-gray-900">Staff Management</h1>
          </div>
          <button
            onClick={handleAddStaff}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error loading staff</p>
            <p className="text-sm">{error.message}</p>
            <button onClick={refetch} className="mt-2 text-sm font-medium underline">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {/* Loading skeleton for Doctors section */}
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 px-4 py-4 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading skeleton for Dental Assistants section */}
            <div>
              <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 px-4 py-4 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No staff members found</p>
            <button
              onClick={handleAddStaff}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first staff member
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Doctors Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Doctors</h2>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {doctors.length}
                </span>
              </div>
              {doctors.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-6 text-center">
                  <p className="text-gray-500 text-sm">No doctors added yet</p>
                </div>
              ) : (
                <div className="space-y-3">{doctors.map(renderStaffCard)}</div>
              )}
            </div>

            {/* Dental Assistants Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Dental Assistants</h2>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  {dentalAssistants.length}
                </span>
              </div>
              {dentalAssistants.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-6 text-center">
                  <p className="text-gray-500 text-sm">No dental assistants added yet</p>
                </div>
              ) : (
                <div className="space-y-3">{dentalAssistants.map(renderStaffCard)}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Staff Form Modal */}
      <StaffFormModal
        staff={editingStaff}
        clinics={clinics}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={creating || updating}
      />
    </div>
  );
};
