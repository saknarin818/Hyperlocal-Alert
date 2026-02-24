import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import { onForegroundMessage } from "./pushNotifications";

import LandingPage from "./pages/LandingPage";
import ReportIncidentPage from "./pages/ReportIncidentPage";
import AdminLoginPage from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import Historypage from "./pages/Historypage";
import EventPage from "./pages/EventPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import ProtectedRoute from "./components/ProtectedRoute";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

type AppProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

function App({ mode, toggleTheme }: AppProps) {
  const [notification, setNotification] = useState<{ title: string; body: string; } | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {};
      if (title && body) {
        setNotification({ title, body });
        setSnackOpen(true);
      }
    });
  }, []);

  const handleSnackClose = () => setSnackOpen(false);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage mode={mode} toggleTheme={toggleTheme} />} />
          <Route path="/report" element={<ReportIncidentPage mode={mode} toggleTheme={toggleTheme} />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/history" element={<Historypage mode={mode} toggleTheme={toggleTheme} />} />
          <Route path="/event" element={<EventPage mode={mode} toggleTheme={toggleTheme} />} />
          <Route path="/register" element={<RegisterPage mode={mode} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<LoginPage mode={mode} toggleTheme={toggleTheme} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage mode={mode} toggleTheme={toggleTheme} />} />

          {/* User ทั่วไป (ต้องล็อกอิน) */}
          <Route path="/profile" element={<PrivateRoute><ProfilePage mode={mode} toggleTheme={toggleTheme} /></PrivateRoute>} />

          {/* Admin (ต้องล็อกอินและเป็น Admin) */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard mode={mode} toggleTheme={toggleTheme} /></ProtectedRoute>} />
        </Routes>
      </Router>

      <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleSnackClose} severity="info" sx={{ width: '100%' }}>
          <strong>{notification?.title}</strong><br />{notification?.body}
        </Alert>
      </Snackbar>
    </AuthProvider>
  );
}

export default App;