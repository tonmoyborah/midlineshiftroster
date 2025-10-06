import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  formatDate,
  getNextDay,
  getPreviousDay,
  isTodayDate,
} from "../../utils/dateUtils";

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const handlePrevious = () => {
    onDateChange(getPreviousDay(selectedDate));
  };

  const handleNext = () => {
    onDateChange(getNextDay(selectedDate));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col items-center max-w-md mx-auto">
        {/* Top row: arrows + calendar + date */}
        <div className="flex items-center justify-between w-full">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Previous day">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="text-base font-semibold text-gray-900">
              {formatDate(selectedDate)}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Next day">
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Bottom row: Go to Today */}
        {!isTodayDate(selectedDate) && (
          <div className="mt -1">
            <button
              onClick={handleToday}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Go to Today
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
