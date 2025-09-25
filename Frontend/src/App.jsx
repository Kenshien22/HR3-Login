import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthContextProvider from "./context/authContext";
import ProtectedRoutes from "./components/ProtectedRoutes";

// Import pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import TimesheetDashboard from "./components/WorkHoursLogging";
function App() {
  return (
    <AuthContextProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoutes>
                  <Navigate to="/admin-dashboard" replace />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoutes>
                  <AdminDashboard />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoutes>
                  <EmployeeDashboard />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoutes>
                  <Settings />
                </ProtectedRoutes>
              }
            />
            {/* Fallback route - redirect any unknown route to admin dashboard if logged in */}
            <Route
              path="*"
              element={
                <ProtectedRoutes>
                  <Navigate to="/admin-dashboard" replace />
                </ProtectedRoutes>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthContextProvider>
  );
}

export default App;
