import React from "react";
import { Users, Plus } from "lucide-react";
import { staff, clinics } from "../data/mockData";

export const StaffManagement: React.FC = () => {
  const getClinicName = (clinicId: string | null) => {
    if (!clinicId) return "No primary clinic";
    const clinic = clinics.find((c) => c.id === clinicId);
    return clinic ? clinic.name : "Unknown";
  };

  const getDayName = (day: number | null) => {
    if (day === null) return "Not set";
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[day];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-gray-700" />
            <h1 className="text-xl font-semibold text-gray-900">
              Staff Management
            </h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        <div className="space-y-3">
          {staff.map((staffMember) => (
            <div
              key={staffMember.id}
              className="bg-white rounded-xl border border-gray-200 px-4 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {staffMember.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        staffMember.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                      {staffMember.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Role:</span>{" "}
                      {staffMember.role === "doctor"
                        ? "Doctor"
                        : "Dental Assistant"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {staffMember.email}
                    </p>
                    <p>
                      <span className="font-medium">Primary Clinic:</span>{" "}
                      {getClinicName(staffMember.primary_clinic_id)}
                    </p>
                    <p>
                      <span className="font-medium">Weekly Off:</span>{" "}
                      {getDayName(staffMember.weekly_off_day)}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
