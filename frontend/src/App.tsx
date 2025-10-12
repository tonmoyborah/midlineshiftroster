import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard } from "./components/auth/AuthGuard";
import { Header } from "./components/layout/Header";
import { Navigation } from "./components/layout/Navigation";
import { Home } from "./pages/Home";
import { AdminLogin } from "./pages/AdminLogin";
import { DailyShifts } from "./pages/DailyShifts";
import { StaffManagement } from "./pages/StaffManagement";
import { LeaveManagement } from "./pages/LeaveManagement";
import { StaffLeaveApplication } from "./pages/StaffLeaveApplication";
import { MyLeaves } from "./pages/MyLeaves";

function App() {
  // Uncomment to test Supabase connection on app load
  useEffect(() => {
    import('./lib/testConnection').then(({ testConnection }) => {
      testConnection();
    });
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - no authentication required */}
          <Route path="/" element={<Home />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/staff-leave-request" element={<StaffLeaveApplication />} />
          <Route path="/my-leaves/:staffId" element={<MyLeaves />} />

          {/* Protected admin routes */}
          <Route
            path="/admin/*"
            element={
              <AuthGuard>
                <div className="min-h-screen bg-[#dcfce7]">
                  <Header title="Shift Manager" />
                  <Navigation />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <main>
                      <Routes>
                        <Route path="/" element={<Navigate to="/admin/shifts" replace />} />
                        <Route path="/shifts" element={<DailyShifts />} />
                        <Route path="/staff" element={<StaffManagement />} />
                        <Route path="/leave" element={<LeaveManagement />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
