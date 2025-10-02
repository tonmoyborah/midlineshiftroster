import React, { useState } from "react";
import { Calendar, Check, X, Clock } from "lucide-react";
import { leaveRequests, staff } from "../data/mockData";
import { format } from "date-fns";

type LeaveStatus = "all" | "pending" | "approved" | "rejected";

export const LeaveManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<LeaveStatus>("all");

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId);
    return staffMember ? staffMember.name : "Unknown";
  };

  const filteredRequests =
    statusFilter === "all"
      ? leaveRequests
      : leaveRequests.filter((lr) => lr.status === statusFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <X className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-gray-700" />
            <h1 className="text-xl font-semibold text-gray-900">
              Leave Management
            </h1>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-4 flex gap-2">
          {(["all", "pending", "approved", "rejected"] as LeaveStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Leave Requests */}
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center">
              <p className="text-gray-500">No leave requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl border border-gray-200 px-4 py-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {getStaffName(request.staff_id)}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {request.leave_type === "planned"
                          ? "📅 Planned"
                          : "🚨 Emergency"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Period:</span>{" "}
                    {format(new Date(request.start_date), "MMM d, yyyy")} -{" "}
                    {format(new Date(request.end_date), "MMM d, yyyy")}
                  </p>
                  {request.reason && (
                    <p>
                      <span className="font-medium">Reason:</span>{" "}
                      {request.reason}
                    </p>
                  )}
                  {request.notes && (
                    <p>
                      <span className="font-medium">Notes:</span>{" "}
                      {request.notes}
                    </p>
                  )}
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Approve
                    </button>
                    <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
