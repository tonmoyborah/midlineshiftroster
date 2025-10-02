import React from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Menu">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
      </div>
    </header>
  );
};
