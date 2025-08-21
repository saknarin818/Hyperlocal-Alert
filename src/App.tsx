// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้าหลัก (Public) */}
        <Route path="/" element={<LandingPage />} />

        {/* หน้า Login (Admin) */}

        {/* Admin Dashboard (ล็อกอินแล้วถึงเข้าได้ - ทำทีหลัง) */}
        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
