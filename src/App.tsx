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
          {/* ========================================== */}
          {/* 🟢 หน้าสาธารณะ (Public) - Guest เข้าดูได้เลย */}
          {/* ========================================== */}
          <Route path="/" element={<LandingPage mode={mode} toggleTheme={toggleTheme} />} />
          <Route path="/event" element={<EventPage mode={mode} toggleTheme={toggleTheme} />} />
          <Route path="/register" element={<RegisterPage mode={mode} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<LoginPage mode={mode} toggleTheme={toggleTheme} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage mode={mode} toggleTheme={toggleTheme} />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ========================================== */}
          {/* 🔵 หน้าสำหรับสมาชิก (Registered User) - ต้อง Login */}
          {/* ========================================== */}
          <Route path="/report" element={<PrivateRoute><ReportIncidentPage mode={mode} toggleTheme={toggleTheme} /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><Historypage mode={mode} toggleTheme={toggleTheme} /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage mode={mode} toggleTheme={toggleTheme} /></PrivateRoute>} />

          {/* ========================================== */}
          {/* 🔴 หน้าสำหรับผู้ดูแลระบบ (Admin) - ต้องเป็น Admin */}
          {/* ========================================== */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard mode={mode} toggleTheme={toggleTheme} /></ProtectedRoute>} />
        </Routes>
      </Router>

      {/* แจ้งเตือน Push Notification (แสดงผลเมื่อเปิดแอปอยู่) */}
      <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleSnackClose} severity="info" sx={{ width: '100%' }}>
          <strong>{notification?.title}</strong><br />{notification?.body}
        </Alert>
      </Snackbar>
    </AuthProvider>
  );
}

export default App;