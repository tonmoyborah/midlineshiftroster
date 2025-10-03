import { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Navigation } from "./components/layout/Navigation";
import { DailyShifts } from "./pages/DailyShifts";
import { StaffManagement } from "./pages/StaffManagement";
import { LeaveManagement } from "./pages/LeaveManagement";

type Page = "shifts" | "staff" | "leave";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("shifts");

  // Uncomment to test Supabase connection on app load
  useEffect(() => {
    import('./lib/testConnection').then(({ testConnection }) => {
      testConnection();
    });
  }, []);

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
