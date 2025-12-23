// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import ReportIncidentPage from "./pages/ReportIncidentPage";
import AdminLoginPage from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import Historypage from "./pages/Historypage";
import EventPage from "./pages/EventPage";
import SubscribePage from "./pages/SubscribePage"; // Add this line

// 👉 กำหนด type ของ props
type AppProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

function App({ mode, toggleTheme }: AppProps) {
  return (
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
  );
}

export default App;
