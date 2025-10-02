import React from 'react';
import { addDays, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';

export const DateNavigator: React.FC<{
	selectedDate: Date;
	onDateChange: (d: Date) => void;
}> = ({ selectedDate, onDateChange }) => {
	return (
		<div className="flex items-center gap-3">
			<button
				className="p-2 rounded-lg bg-white shadow hover:bg-slate-50"
				onClick={() => onDateChange(addDays(selectedDate, -1))}
				data-testid="prev-day-button"
			>
				<ChevronLeft className="w-5 h-5 text-slate-700" />
			</button>
			<div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow">
				<Calendar className="w-4 h-4 text-slate-600" />
				<span className="font-medium text-slate-900" data-testid="current-date">
					{format(selectedDate, 'EEE, MMM d, yyyy')}
				</span>
			</div>
			<button
				className="p-2 rounded-lg bg-white shadow hover:bg-slate-50"
				onClick={() => onDateChange(addDays(selectedDate, 1))}
				data-testid="next-day-button"
			>
				<ChevronRight className="w-5 h-5 text-slate-700" />
			</button>
		</div>
	);
}; 