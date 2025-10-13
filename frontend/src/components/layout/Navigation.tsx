import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, FileText } from "lucide-react";

export const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { id: "shifts", label: "Shifts", icon: Calendar, path: "/admin/shifts" },
    { id: "staff", label: "Staff", icon: Users, path: "/admin/staff" },
    { id: "leave", label: "Leave", icon: FileText, path: "/admin/leave" },
  ] as const;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}>
              <Icon className="w-4 h-4" />
              {item.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
};
