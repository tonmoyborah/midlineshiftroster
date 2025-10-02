import { useState } from "react";
import { Header } from "./components/layout/Header";
import { Navigation } from "./components/layout/Navigation";
import { DailyShifts } from "./pages/DailyShifts";
import { StaffManagement } from "./pages/StaffManagement";
import { LeaveManagement } from "./pages/LeaveManagement";

type Page = "shifts" | "staff" | "leave";

import { supabase } from './lib/supabase';

const test = async () => {
  const { data, error } = await supabase.from('clinics').select('*');
  console.log('Clinics:', data, error);
};

test();

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("shifts");

  const renderPage = () => {
    switch (currentPage) {
      case "shifts":
        return <DailyShifts />;
      case "staff":
        return <StaffManagement />;
      case "leave":
        return <LeaveManagement />;
      default:
        return <DailyShifts />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Shift Manager" />
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default App;
