import React from "react";
import { Calendar, Users, FileText } from "lucide-react";

interface NavigationProps {
  currentPage: "shifts" | "staff" | "leave";
  onPageChange: (page: "shifts" | "staff" | "leave") => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
}) => {
  const navItems = [
    { id: "shifts", label: "Shifts", icon: Calendar },
    { id: "staff", label: "Staff", icon: Users },
    { id: "leave", label: "Leave", icon: FileText },
  ] as const;

  return (
    <nav className="bg-white border-b border-gray-200 px-4">
      <div className="flex gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}>
              <Icon className="w-4 h-4" />
              {item.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
