import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Navbar from "../components/Navbar";
import TimeFilter from "../components/TimeFilter";
import IncidentsChart from "../components/IncidentsChart";
import IncidentsList from "../components/IncidentsList";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/* ================= TYPES ================= */
interface Incident {
  id: string;
  type: string;
  description: string;
  location?: string;
  contact?: string;
  status: "กำลังตรวจสอบ" | "เสร็จสิ้น";
  createdAt: Timestamp;
}

/* ================= PROPS ================= */
type HistoryPageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

/* ================= PAGE ================= */
export default function HistoryPage({ mode, toggleTheme }: HistoryPageProps) {
  const theme = useTheme();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<number>(7);

  // 🔹 ตรวจสอบสถานะธีม
  const isDark = mode === "dark";

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "incidents"),
          where("status", "==", "เสร็จสิ้น")
        );
        const snap = await getDocs(q);
        setIncidents(
          snap.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Incident)
          )
        );
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ================= FILTER BY TIME ================= */
  const filteredIncidents = useMemo(() => {
    const limitTime = Date.now() - days * 24 * 60 * 60 * 1000;
    return incidents.filter(
      (i) => i.createdAt.toMillis() >= limitTime
    );
  }, [incidents, days]);

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        // 🔹 ปรับสีพื้นหลังตามธีม Slate/Navy
        bgcolor: isDark ? "#0f172a" : "#f8fafc",
        color: isDark ? "#fff" : "text.primary",
        transition: "0.3s"
      }}
    >
      <Navbar mode={mode} toggleTheme={toggleTheme} />
      
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <motion.div 
          initial={{ opacity: 0, y: 24 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}>
            <Typography 
              variant="h4" 
              fontWeight={800} 
              sx={{ 
                color: isDark ? "#38bdf8" : theme.palette.primary.main,
                fontSize: { xs: "1.75rem", md: "2.25rem" }
              }}
            >
              ประวัติและสถิติเหตุการณ์
            </Typography>
            <Typography sx={{ color: isDark ? "#94a3b8" : "text.secondary", mt: 1 }}>
              สรุปข้อมูลเหตุการณ์ที่ดำเนินการเสร็จสิ้นแล้วในชุมชน
            </Typography>
          </Box>

          {/* ===== UI Controls ===== */}
          <Box sx={{ 
            bgcolor: isDark ? "#1e293b" : "#fff", 
            p: 3, 
            borderRadius: 4, 
            border: isDark ? "1px solid #334155" : "none",
            boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
            mb: 4
          }}>
            <TimeFilter days={days} onChange={setDays} />
          </Box>

          {/* ===== Chart & List ===== */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <IncidentsChart
                incidents={filteredIncidents}
                loading={loading}
              />
              <IncidentsList incidents={filteredIncidents} />
            </Box>
          )}
        </motion.div>
      </Container>
    </Box>
  );
}