import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./AuthContext";
import Signup from "./signup";
import Login from "./login";
import Home from "./home";
import Dashboard from "./Dashboard";
import SubmitComplaint from "./SubmitComplaint";
import MyComplaints from "./MyComplaints";
import Profile from "./Profile";
import ComplaintStatus from "./ComplaintStatus";
import AdminDashboard from "./AdminDashboard";
import EscalateComplaint from "./EscalateComplaint"; // ✅ New import
import "./App.css";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) {
    return user.role === "admin" ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit-complaint"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <SubmitComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-complaints"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <MyComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <ComplaintStatus />
              </ProtectedRoute>
            }
          />

          {/* ✅ New Escalation Page Route */}
          <Route
            path="/complaints/:id/escalate"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]}>
                <EscalateComplaint />
              </ProtectedRoute>
            }
          />

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
