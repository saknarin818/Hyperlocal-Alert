// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ReportIncidentPage from "./pages/ReportIncidentPage";
// import component หน้า login
import AdminLoginPage from "./pages/admin/login";
// import component หน้า dashboard
import AdminDashboard from "./pages/admin/dashboard";
import Historypage from "./pages/Historypage";
// import EventsPage from "./pages/EventsPage";
// import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้าหลัก (Public) */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/report" element={<ReportIncidentPage />} />
        {/* <Route path="/about" element={<AboutPage />} /> */}

        {/* หน้า Login (Admin) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Dashboard (ล็อกอินแล้วถึงเข้าได้ - ทำทีหลัง) */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/history" element={<Historypage />} />
        
        {/* <Route path="/events" element={<EventsPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
