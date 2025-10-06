import React from "react";
import { Check, AlertTriangle, ArrowRight, X, Circle } from "lucide-react";
import type { StaffStatus } from "../../types/models";

interface StatusBadgeProps {
  status: StaffStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "present":
        return {
          icon: Check,
          text: "Present",
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          iconColor: "text-green-600",
        };
      case "visiting":
        return {
          icon: ArrowRight,
          text: "Visiting",
          bgColor: "bg-orange-50",
          textColor: "text-orange-700",
          iconColor: "text-orange-600",
        };
      case "weekly_off":
        return {
          icon: X,
          text: "Weekly Off",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          iconColor: "text-gray-600",
        };
      case "approved_leave":
        return {
          icon: Circle,
          text: "Approved Leave",
          bgColor: "bg-purple-50",
          textColor: "text-purple-700",
          iconColor: "text-purple-600",
        };
      case "unapproved_leave":
        return {
          icon: AlertTriangle,
          text: "Unapproved Leave",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-700",
          iconColor: "text-yellow-600",
        };
      default:
        return {
          icon: Circle,
          text: "Unknown",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          iconColor: "text-gray-600",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bgColor}`}>
      <Icon className={`w-4 h-4 ${config.iconColor}`} />
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
};
