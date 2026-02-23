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

import AdminNavbar from "../../components/AdminNavbar";
import IncidentsChart from "../../components/IncidentsChart";
import AdminIncidentTable from "../../components/AdminIncidentTable";

type AdminDashboardProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function AdminDashboard({ mode, toggleTheme }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [notification, setNotification] = useState<{ message: string; time: Timestamp } | null>(null);

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

  /* ===================== CALCULATE STATS ===================== */
  const totalIncidents = incidents.length;
  const pendingIncidents = incidents.filter((i) => i.status === "กำลังตรวจสอบ").length;
  const resolvedIncidents = incidents.filter((i) => i.status === "เสร็จสิ้น").length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminNavbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          Admin Dashboard
        </Typography>

        {/* ================= SUMMARY CARDS (แสดงผลตลอดเวลา) ================= */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
            mb: 4,
          }}
        >
          {/* การ์ดทั้งหมด */}
          <Card sx={{ bgcolor: "info.main", color: "white", borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">เหตุการณ์ทั้งหมด</Typography>
                <Typography variant="h3" fontWeight="bold">{totalIncidents}</Typography>
              </Box>
              <ReportProblemIcon sx={{ fontSize: 60, opacity: 0.3 }} />
            </CardContent>
          </Card>

          {/* การ์ดกำลังตรวจสอบ */}
          <Card sx={{ bgcolor: "warning.main", color: "white", borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">กำลังตรวจสอบ</Typography>
                <Typography variant="h3" fontWeight="bold">{pendingIncidents}</Typography>
              </Box>
              <AssignmentLateIcon sx={{ fontSize: 60, opacity: 0.3 }} />
            </CardContent>
          </Card>

          {/* การ์ดเสร็จสิ้นแล้ว */}
          <Card sx={{ bgcolor: "success.main", color: "white", borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">แก้ไขเสร็จสิ้น</Typography>
                <Typography variant="h3" fontWeight="bold">{resolvedIncidents}</Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 60, opacity: 0.3 }} />
            </CardContent>
          </Card>
        </Box>

        {/* ================= TABS ================= */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, val) => setCurrentTab(val)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{ "& .MuiTab-root": { fontWeight: "bold", fontSize: "1rem" } }}
          >
            <Tab icon={<FormatListBulletedIcon />} iconPosition="start" label="รายการแจ้งเหตุ" />
            <Tab icon={<InsertChartIcon />} iconPosition="start" label="กราฟสถิติ" />
          </Tabs>
        </Box>

        {/* ================= CONTENT ================= */}
        {/* แท็บ 0: ตารางรายการ */}
        {currentTab === 0 && <AdminIncidentTable incidents={incidents} loading={loading} />}

        {/* แท็บ 1: กราฟ */}
        {currentTab === 1 && (
          <Box sx={{ animation: "fadeIn 0.3s" }}>
            <IncidentsChart incidents={incidents} loading={loading} />
          </Box>
        )}
      </Container>

      {/* ================= NOTIFICATION ================= */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="info" onClose={() => setNotification(null)}>
          <Typography fontWeight="bold">{notification?.message}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}