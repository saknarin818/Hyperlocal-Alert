// src/pages/admin/AdminDashboard.tsx
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

import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  Timestamp,
  getCountFromServer,
} from "firebase/firestore";

import AdminNavbar from "../../components/AdminNavbar";
import IncidentsChart from "../../components/IncidentsChart";
import AdminIncidentTable from "../../components/AdminIncidentTable";

type AdminDashboardProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

// Helper function สำหรับจัดการสีโปร่งใส
function alpha(color: string, opacity: number) {
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
}

export default function AdminDashboard({ mode, toggleTheme }: AdminDashboardProps) {
  const navigate = useNavigate();
  const isDark = mode === "dark";

  const [incidents, setIncidents] = useState<any[]>([]);
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

    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
    const unsubTable = onSnapshot(q, (snap) => {
      setIncidents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

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

    return () => {
      unsubAuth();
      unsubTable();
      unsubNotify();
    };
  }, [navigate]);

  /* ===================== FETCH USER STATS ===================== */
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const usersCol = collection(db, "users");
        const totalSnapshot = await getCountFromServer(usersCol);
        setTotalUsers(totalSnapshot.data().count);

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); 
        const onlineQuery = query(usersCol, where("lastOnline", ">=", fiveMinutesAgo));
        const onlineSnapshot = await getCountFromServer(onlineQuery);
        setOnlineUsers(onlineSnapshot.data().count);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserStats();
    const interval = setInterval(fetchUserStats, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ===================== CALCULATE STATS ===================== */
  const totalIncidents = incidents.length;
  const pendingIncidents = incidents.filter((i) => i.status === "กำลังตรวจสอบ").length;
  const resolvedIncidents = incidents.filter((i) => i.status === "เสร็จสิ้น").length;

  // ข้อมูลสำหรับการ์ดสถิติ
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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
            gap: 2,
            mb: 5,
          }}
        >
          {summaryCards.map((item, index) => (
            <Card key={index} sx={{ 
              bgcolor: isDark ? "#1e293b" : "#fff", 
              color: isDark ? "#fff" : "text.primary",
              borderRadius: 4, 
              border: isDark ? `1px solid ${alpha(item.color, 0.3)}` : "none",
              boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
              overflow: "hidden",
              position: "relative"
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                      {item.value}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(item.color, 0.1), 
                    color: item.color,
                    display: "flex",
                    alignItems: "center"
                  }}>
                    {/* ✅ แก้ไข Error ตรงนี้โดยการเช็ค isValidElement และระบุ Type */}
                    {React.isValidElement(item.icon) && 
                      React.cloneElement(item.icon as React.ReactElement<any>, { fontSize: "medium" })
                    }
                  </Box>
                </Box>
                <Box sx={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 4, bgcolor: item.color }} />
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* ================= TABS ================= */}
        <Box sx={{ 
          bgcolor: isDark ? "#1e293b" : "#fff",
          borderRadius: 4,
          p: 1,
          mb: 4,
          border: isDark ? "1px solid #334155" : "none",
          boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.05)"
        }}>
          <Tabs
            value={currentTab}
            onChange={(_e, val) => setCurrentTab(val)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{ 
                "& .MuiTab-root": { 
                    fontWeight: 700, 
                    borderRadius: 3,
                    minHeight: 50,
                    color: isDark ? "#94a3b8" : "text.secondary",
                    "&.Mui-selected": { color: "#38bdf8" }
                },
                "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0", bgcolor: "#38bdf8" }
            }}
          >
            <Tab icon={<FormatListBulletedIcon />} iconPosition="start" label="รายการแจ้งเหตุ" />
            <Tab icon={<InsertChartIcon />} iconPosition="start" label="กราฟสถิติ" />
          </Tabs>
        </Box>

        {/* ================= CONTENT ================= */}
        <Box sx={{ transition: "0.3s" }}>
          {currentTab === 0 ? (
            <AdminIncidentTable incidents={incidents} loading={loading} />
          ) : (
            <Box sx={{ 
              bgcolor: isDark ? "#1e293b" : "#fff", 
              p: 3, 
              borderRadius: 4, 
              border: isDark ? "1px solid #334155" : "none",
              animation: "fadeIn 0.5s ease" 
            }}>
               <IncidentsChart incidents={incidents} loading={loading} />
            </Box>
          )}
        </Box>
      </Container>

      {/* ================= NOTIFICATION ================= */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          severity="info" 
          onClose={() => setNotification(null)}
          sx={{ 
            borderRadius: 3, 
            bgcolor: isDark ? "#38bdf8" : "info.main", 
            color: "#fff",
            boxShadow: 4,
            "& .MuiAlert-icon": { color: "#fff" }
          }}
        >
          <Typography fontWeight="bold">{notification?.message}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}