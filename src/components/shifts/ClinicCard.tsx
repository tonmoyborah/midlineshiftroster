import React from 'react';
import type { ClinicRoster } from '@/types/models';
import { Check, AlertTriangle, MoveUpRight } from 'lucide-react';

export const ClinicCard: React.FC<{ clinic: ClinicRoster; date: Date }> = ({ clinic }) => {
	const badge = (() => {
		if (clinic.status === 'no_staff') {
			return (
				<span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-xl text-sm">
					<AlertTriangle className="w-4 h-4" /> No Staff Assigned
				</span>
			);
		}
		if (clinic.status === 'visiting') {
			return (
				<span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-xl text-sm">
					<MoveUpRight className="w-4 h-4" /> Visiting
				</span>
			);
		}
		return (
			<span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-sm">
				<Check className="w-4 h-4" /> Present
			</span>
		);
	})();

	return (
		<div data-testid="clinic-card" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
			<div className="flex items-center justify-between p-4">
				<div>
					<div className="text-xl font-semibold text-slate-900">{clinic.clinic_name}</div>
					<div className="text-slate-500 text-sm">{/* location optional */}</div>
				</div>
				{badge}
			</div>
			<div className="px-4 pb-4 space-y-4">
				<div>
					<div className="text-slate-500 text-sm">Doctor</div>
					<div className="text-slate-900 font-medium">
						{clinic.doctor_name ?? <span className="italic text-slate-400">Not assigned</span>}
					</div>
				</div>
				<div>
					<div className="text-slate-500 text-sm">Dental Assistant</div>
					<div className="text-slate-900 font-medium">
						{clinic.da_name ?? <span className="italic text-slate-400">Not assigned</span>}
					</div>
				</div>
			</div>
		</div>
	);
}; 