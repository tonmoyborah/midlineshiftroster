import { supabase } from '@/lib/supabase';
import { startOfDay } from 'date-fns';
import type { ClinicRoster } from '@/types/models';

export class ShiftsService {
	static async getRosterForDate(date: Date): Promise<ClinicRoster[]> {
		const { data, error } = await supabase.rpc('get_clinic_roster_for_date', {
			p_date: startOfDay(date).toISOString().split('T')[0]
		});
		if (error) throw error;
		return data as unknown as ClinicRoster[];
	}

	static async getAssignedStaffForDate(date: Date) {
		const { data, error } = await supabase
			.from('shift_assignments')
			.select(
				`*, staff:staff_id ( id, name, role, primary_clinic_id ), clinic:clinic_id ( id, name, location )`
			)
			.eq('shift_date', startOfDay(date).toISOString().split('T')[0]);
		if (error) throw error;
		return data;
	}

	static async getUnassignedStaffForDate(date: Date) {
		const dateStr = startOfDay(date).toISOString().split('T')[0];
		const { data, error } = await supabase
			.from('staff')
			.select(`*, primary_clinic:primary_clinic_id ( id, name, location )`)
			.eq('is_active', true)
			.not('id', 'in', `(
				SELECT staff_id FROM shift_assignments WHERE shift_date = '${dateStr}'
			)`);
		if (error) throw error;
		return data;
	}

	static async assignStaff(clinicId: string, staffId: string, date: Date, notes?: string) {
		const { data: staff } = await supabase
			.from('staff')
			.select('primary_clinic_id')
			.eq('id', staffId)
			.single();
		const isVisiting = staff?.primary_clinic_id !== clinicId;
		const { data, error } = await supabase
			.from('shift_assignments')
			.upsert({
				clinic_id: clinicId,
				staff_id: staffId,
				shift_date: startOfDay(date).toISOString().split('T')[0],
				is_visiting: isVisiting,
				notes: notes || null
			})
			.select()
			.single();
		if (error) throw error;
		return data;
	}

	static async removeAssignment(clinicId: string, staffId: string, date: Date) {
		const { error } = await supabase
			.from('shift_assignments')
			.delete()
			.match({
				clinic_id: clinicId,
				staff_id: staffId,
				shift_date: startOfDay(date).toISOString().split('T')[0]
			});
		if (error) throw error;
	}
} 