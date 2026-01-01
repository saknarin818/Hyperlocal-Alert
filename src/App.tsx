// src/App.tsx
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
import SubscribePage from "./pages/SubscribePage";

// 👉 กำหนด type ของ props
type AppProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

function App({ mode, toggleTheme }: AppProps) {
  // --- 2. เพิ่ม State สำหรับจัดการ Snackbar ---
  const [notification, setNotification] = useState<{
    title: string;
    body: string;
  } | null>(null);
  const [snackOpen, setSnackOpen] = useState(false); // First declaration

  // --- 3. เพิ่ม useEffect เพื่อดักฟังข้อความ ---
  useEffect(() => {
    // onForegroundMessage จะทำงานเมื่อมี push notification เข้ามาตอนแอปเปิดอยู่
    onForegroundMessage((payload) => {
      console.log("Foreground message received:", payload);

      const { title, body } = payload.notification || {};
      if (title && body) {
        setNotification({ title, body });
        setSnackOpen(true);
      }
    });
  }, []);

  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  const isLoading = false; // useSomeLoadingState(); // Replace with your actual loading state

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Router>
        <Routes>
          {/* หน้าหลัก (Public) */}
          <Route
            path="/"
            element={<LandingPage mode={mode} toggleTheme={toggleTheme} />}
          />

          <Route
            path="/report"
            element={<ReportIncidentPage mode={mode} toggleTheme={toggleTheme} />}
          />

          {/* หน้า Login (Admin) */}
          <Route
            path="/admin/login"
            element={<AdminLoginPage />}
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard mode={mode} toggleTheme={toggleTheme} />}
          />

          <Route path="/history" element={<Historypage mode={mode} toggleTheme={toggleTheme} />} />

          <Route
            path="/event"
            element={<EventPage mode={mode} toggleTheme={toggleTheme} />}
          />

          <Route
            path="/subscribe" // Add this route
            element={<SubscribePage mode={mode} toggleTheme={toggleTheme} />}
          />

        </Routes>
      </Router>

      {/* --- 4. เพิ่ม Component Snackbar เข้าไป --- */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={6000} // ปิดเองใน 6 วินาที
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // แสดงด้านบนตรงกลาง
      >
        <Alert onClose={handleSnackClose} severity="info" sx={{ width: '100%' }}>
          <strong>{notification?.title}</strong><br />
          {notification?.body}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;
