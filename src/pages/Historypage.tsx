import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
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

  // ✅ ใช้ days ตรง ๆ
  const [days, setDays] = useState<number>(7);

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
    <Box minHeight="100vh" bgcolor={theme.palette.background.default}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h4" fontWeight={800} mb={3}>
            ประวัติและสถิติเหตุการณ์
          </Typography>

          {/* ===== Time Filter ===== */}
          <TimeFilter days={days} onChange={setDays} />

          {/* ===== Chart ===== */}
          <IncidentsChart
            incidents={filteredIncidents}
            loading={loading}
          />

          {/* ===== Incident List ===== */}
          <IncidentsList incidents={filteredIncidents} />
        </motion.div>
      </Container>
    </Box>
  );
}
