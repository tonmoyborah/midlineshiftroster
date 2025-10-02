import React, { useMemo, useState } from 'react';
import { DateNavigator } from '@/components/shifts/DateNavigator';
import { FilterPanel } from '@/components/shifts/FilterPanel';
import { ClinicCard } from '@/components/shifts/ClinicCard';
import { StaffCard } from '@/components/shifts/StaffCard';
import { useRosterForDate, useUnassignedStaff } from '@/hooks/useShifts';
import { useRealtimeShifts } from '@/hooks/useRealtime';

export const DailyShifts: React.FC = () => {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [filterClinic, setFilterClinic] = useState<string | null>(null);

	const { data: roster, isLoading: isLoadingRoster } = useRosterForDate(selectedDate);
	const { data: unassignedStaff, isLoading: isLoadingUnassigned } = useUnassignedStaff(selectedDate);

	useRealtimeShifts(selectedDate);

	const filteredRoster = useMemo(
		() => (filterClinic ? roster?.filter((r) => r.clinic_id === filterClinic) : roster),
		[roster, filterClinic]
	);

	return (
		<div className="min-h-screen bg-slate-50">
			<div className="px-4 pt-4">
				<DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
				<FilterPanel filterClinic={filterClinic} onFilterChange={setFilterClinic} />
			</div>

			<div className="px-4 py-5 space-y-4">
				<h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide px-1">
					Clinic Roster
				</h2>

				{isLoadingRoster ? (
					<div>Loading roster...</div>
				) : (
					filteredRoster?.map((clinic) => (
						<ClinicCard key={clinic.clinic_id} clinic={clinic} date={selectedDate} />
					))
				)}

				<h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide px-1 mt-8">
					Other Staff
				</h2>

				{isLoadingUnassigned ? (
					<div>Loading staff...</div>
				) : (
					unassignedStaff?.map((staff) => (
						<StaffCard key={staff.id} staff={staff} date={selectedDate} />
					))
				)}
			</div>
		</div>
	);
}; 