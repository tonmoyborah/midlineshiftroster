import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DailyShifts } from '@/pages/DailyShifts';

const App: React.FC = () => {
	return (
		<Routes>
			<Route path="/" element={<DailyShifts />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
};

export default App; 