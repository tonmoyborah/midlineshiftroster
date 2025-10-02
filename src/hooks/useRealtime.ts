import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimeShifts = (date: Date) => {
	const queryClient = useQueryClient();

	useEffect(() => {
		const dateStr = date.toISOString().split('T')[0];
		const channel: RealtimeChannel = supabase
			.channel(`shifts:${dateStr}`)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'shift_assignments', filter: `shift_date=eq.${dateStr}` },
				() => {
					queryClient.invalidateQueries({ queryKey: ['roster', date.toISOString()] });
					queryClient.invalidateQueries({ queryKey: ['assigned-staff', date.toISOString()] });
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [date, queryClient]);
}; 