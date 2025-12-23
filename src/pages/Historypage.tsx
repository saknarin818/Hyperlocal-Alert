import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// Chart.js register
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  status: "กำลังตรวจสอบ" | "เสร็จสิ้น";
  createdAt: Timestamp;
}

const processDataForChart = (incidents: Incident[]) => {
  const counts: Record<string, number> = {};
  incidents.forEach((i) => {
    counts[i.type] = (counts[i.type] || 0) + 1;
  });

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: "จำนวนเหตุการณ์",
        data: Object.values(counts),
        backgroundColor: [
          "rgba(255,99,132,0.6)",
          "rgba(54,162,235,0.6)",
          "rgba(255,206,86,0.6)",
          "rgba(75,192,192,0.6)",
          "rgba(153,102,255,0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };
};

type HistoryPageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function HistoryPage({
  mode,
  toggleTheme,
}: HistoryPageProps) {
  const theme = useTheme();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

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
            (doc) => ({ id: doc.id, ...doc.data() }) as Incident
          )
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* ✅ Navbar เหมือนหน้าอื่น */}
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ color: theme.palette.text.primary, mb: 4 }}
          >
            ประวัติและสถิติเหตุการณ์
          </Typography>

          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
            }}
          >
            {loading ? (
              <Typography color="text.secondary">
                กำลังโหลดข้อมูล...
              </Typography>
            ) : (
              <Box sx={{ height: 400 }}>
                <Bar
                  data={processDataForChart(incidents)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: theme.palette.text.primary,
                        },
                      },
                      title: {
                        display: true,
                        text: "สรุปจำนวนเหตุการณ์ตามประเภท",
                        color: theme.palette.text.primary,
                        font: { size: 18 },
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: theme.palette.text.secondary,
                        },
                      },
                      y: {
                        ticks: {
                          color: theme.palette.text.secondary,
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
