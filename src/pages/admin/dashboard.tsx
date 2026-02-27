// src/pages/admin/dashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from "@mui/material";

// Icons
import InsertChartIcon from "@mui/icons-material/InsertChart";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import GroupIcon from "@mui/icons-material/Group";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CategoryIcon from "@mui/icons-material/Category"; // 🔹 เพิ่มไอคอนนี้

import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  Timestamp,
} from "firebase/firestore";

// Components
import AdminNavbar from "../../components/admin/AdminNavbar";
import IncidentsChart from "../../components/IncidentsChart";
import AdminIncidentTable from "../../components/admin/AdminIncidentTable";
import AdminUserTable, { UserData } from "../../components/admin/AdminUserTable";
import AdminIncidentTypes from "../../components/admin/AdminIncidentTypes"; // 🔹 นำเข้าคอมโพเนนต์จัดการประเภทเหตุการณ์

type AdminDashboardProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

// Helper function 
function alpha(color: string, opacity: number) {
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
}

export default function AdminDashboard({ mode, toggleTheme }: AdminDashboardProps) {
  const navigate = useNavigate();
  const isDark = mode === "dark";

  const [incidents, setIncidents] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<UserData[]>([]); 
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [notification, setNotification] = useState<{ message: string; time: Timestamp } | null>(null);

  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);

  /* ===================== AUTH & FIRESTORE ===================== */
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/admin/login");
    });

    // 1. ดึงข้อมูลเหตุการณ์
    const qIncidents = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
    const unsubIncidents = onSnapshot(qIncidents, (snap) => {
      setIncidents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // 2. แจ้งเตือนเหตุการณ์ใหม่
    const qNotify = query(
      collection(db, "incidents"),
      where("status", "==", "กำลังตรวจสอบ"),
      orderBy("createdAt", "desc")
    );
    const unsubNotify = onSnapshot(qNotify, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const time = data.createdAt as Timestamp;
          if (time && Date.now() - time.toDate().getTime() < 15000) {
            setNotification({ message: `มีเหตุการณ์ใหม่: ${data.type}`, time });
          }
        }
      });
    });

    // 3. ดึงข้อมูลผู้ใช้งานทั้งหมด
    const qUsers = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const fetchedUsers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
      setUsersList(fetchedUsers);
      setTotalUsers(fetchedUsers.length);

      const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
      const onlineCount = fetchedUsers.filter(u => {
        if (!u.lastOnline) return false;
        const lastOnlineTime = u.lastOnline.toDate ? u.lastOnline.toDate().getTime() : new Date(u.lastOnline).getTime();
        return lastOnlineTime >= fiveMinsAgo;
      }).length;
      
      setOnlineUsers(onlineCount);
    });

    return () => {
      unsubAuth();
      unsubIncidents();
      unsubNotify();
      unsubUsers();
    };
  }, [navigate]);

  /* ===================== CALCULATE STATS ===================== */
  const totalIncidents = incidents.length;
  const pendingIncidents = incidents.filter((i) => i.status === "กำลังตรวจสอบ").length;
  const resolvedIncidents = incidents.filter((i) => i.status === "เสร็จสิ้น").length;

  const summaryCards = [
    { label: "ผู้ใช้งานทั้งหมด", value: totalUsers, icon: <GroupIcon />, color: "#6366f1" },
    { label: "ออนไลน์ขณะนี้", value: onlineUsers, icon: <OnlinePredictionIcon />, color: "#10b981" },
    { label: "เหตุการณ์ทั้งหมด", value: totalIncidents, icon: <ReportProblemIcon />, color: "#0ea5e9" },
    { label: "กำลังตรวจสอบ", value: pendingIncidents, icon: <AssignmentLateIcon />, color: "#f59e0b" },
    { label: "แก้ไขเสร็จสิ้น", value: resolvedIncidents, icon: <CheckCircleIcon />, color: "#22c55e" },
  ];

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: isDark ? "#0f172a" : "#f8fafc",
      color: isDark ? "#fff" : "text.primary",
      transition: "0.3s"
    }}>
      <AdminNavbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={800} mb={4} sx={{ color: isDark ? "#38bdf8" : "primary.main" }}>
          Admin Dashboard
        </Typography>

        {/* ================= SUMMARY CARDS ================= */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }, gap: 2, mb: 5 }}>
          {summaryCards.map((item, index) => (
            <Card key={index} sx={{ bgcolor: isDark ? "#1e293b" : "#fff", color: isDark ? "#fff" : "text.primary", borderRadius: 4, border: isDark ? `1px solid ${alpha(item.color, 0.3)}` : "none", boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden", position: "relative" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: 600 }}>{item.label}</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>{item.value}</Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(item.color, 0.1), color: item.color, display: "flex", alignItems: "center" }}>
                    {React.isValidElement(item.icon) && React.cloneElement(item.icon as React.ReactElement<any>, { fontSize: "medium" })}
                  </Box>
                </Box>
                <Box sx={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 4, bgcolor: item.color }} />
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* ================= TABS ================= */}
        <Box sx={{ bgcolor: isDark ? "#1e293b" : "#fff", borderRadius: 4, p: 1, mb: 4, border: isDark ? "1px solid #334155" : "none", boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.05)" }}>
          <Tabs
            value={currentTab}
            onChange={(_e, val) => setCurrentTab(val)}
            variant="scrollable" 
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
            sx={{ "& .MuiTab-root": { fontWeight: 700, borderRadius: 3, minHeight: 50, color: isDark ? "#94a3b8" : "text.secondary", "&.Mui-selected": { color: "#38bdf8" } }, "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0", bgcolor: "#38bdf8" } }}
          >
            <Tab icon={<FormatListBulletedIcon />} iconPosition="start" label="รายการแจ้งเหตุ" />
            <Tab icon={<InsertChartIcon />} iconPosition="start" label="กราฟสถิติ" />
            <Tab icon={<AccountCircleIcon />} iconPosition="start" label="ผู้ใช้งานระบบ" />
            <Tab icon={<CategoryIcon />} iconPosition="start" label="ตั้งค่าประเภทเหตุการณ์" /> {/* 🔹 เพิ่มแท็บที่ 4 ตรงนี้ */}
          </Tabs>
        </Box>

        {/* ================= CONTENT ================= */}
        <Box sx={{ transition: "0.3s" }}>
          {currentTab === 0 && <AdminIncidentTable incidents={incidents} loading={loading} />}
          
          {currentTab === 1 && (
            <Box sx={{ bgcolor: isDark ? "#1e293b" : "#fff", p: 3, borderRadius: 4, border: isDark ? "1px solid #334155" : "none", animation: "fadeIn 0.5s ease" }}>
               <IncidentsChart incidents={incidents} loading={loading} />
            </Box>
          )}

          {currentTab === 2 && <AdminUserTable usersList={usersList} isDark={isDark} incidents={incidents} />}

          {/* 🔹 เรียกใช้งานหน้าจอตั้งค่าเมื่อผู้ใช้กดมาที่แท็บที่ 4 (index 3) */}
          {currentTab === 3 && <AdminIncidentTypes isDark={isDark} />}

        </Box>
      </Container>

      {/* ================= NOTIFICATION ================= */}
      <Snackbar open={!!notification} autoHideDuration={6000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity="info" onClose={() => setNotification(null)} sx={{ borderRadius: 3, bgcolor: isDark ? "#38bdf8" : "info.main", color: "#fff", boxShadow: 4, "& .MuiAlert-icon": { color: "#fff" } }}>
          <Typography fontWeight="bold">{notification?.message}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}