export interface Clinic {
	id: string;
	name: string;
	location: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface Staff {
	id: string;
	email: string;
	name: string;
	role: 'doctor' | 'dental_assistant';
	primary_clinic_id: string | null;
	weekly_off_day: number | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface ShiftAssignment {
	id: string;
	clinic_id: string;
	staff_id: string;
	shift_date: string;
	is_visiting: boolean;
	notes: string | null;
	created_at: string;
	updated_at: string;
}

export interface LeaveRequest {
	id: string;
	staff_id: string;
	start_date: string;
	end_date: string;
	leave_type: 'planned' | 'emergency';
	reason: string | null;
	status: 'pending' | 'approved' | 'rejected';
	approved_by: string | null;
	approved_at: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
}

export interface ClinicRoster {
	clinic_id: string;
	clinic_name: string;
	doctor_id: string | null;
	doctor_name: string | null;
	da_id: string | null;
	da_name: string | null;
	notes: string | null;
	status: 'present' | 'visiting' | 'no_staff';
}

export type StaffStatus =
	| 'present'
	| 'visiting'
	| 'weekly_off'
	| 'approved_leave'
	| 'unapproved_leave'
	| 'available'; 