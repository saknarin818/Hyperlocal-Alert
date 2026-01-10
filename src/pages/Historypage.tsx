import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
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
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

/* ================= Chart.js register ================= */
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

/* ================= TIME FILTER ================= */
type TimeRange = "1d" | "3d" | "5d" | "7d" | "30d" | "60d" | "90d" | "1y";
const timeRanges: { value: TimeRange; label: string; days: number }[] = [
  { value: "1d", label: "1 วัน", days: 1 },
  { value: "3d", label: "3 วัน", days: 3 },
  { value: "5d", label: "5 วัน", days: 5 },
  { value: "7d", label: "1 สัปดาห์", days: 7 },
  { value: "30d", label: "1 เดือน", days: 30 },
  { value: "60d", label: "2 เดือน", days: 60 },
  { value: "90d", label: "3 เดือน", days: 90 },
  { value: "1y", label: "1 ปี", days: 365 },
];

/* ================= LABEL ภาษาไทย ================= */
const typeLabelTH: Record<string, string> = {
  fire: "ไฟไหม้",
  accident: "อุบัติเหตุ",
  crime: "อาชญากรรม",
  medical: "เหตุฉุกเฉินทางการแพทย์",
  disaster: "ภัยพิบัติ",
  utility: "สาธารณูปโภค",
  flood: "น้ำท่วม",
  electricity: "ไฟฟ้าขัดข้อง",
  water: "น้ำประปาขัดข้อง",
  general: "เหตุทั่วไป",
  other: "เหตุการณ์อื่น ๆ",
};

/* ================= CHART DATA ================= */
const processDataForChart = (incidents: Incident[]) => {
  const counts: Record<string, number> = {};
  incidents.forEach((i) => {
    const label = typeLabelTH[i.type] || i.type;
    counts[label] = (counts[label] || 0) + 1;
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
        borderRadius: 6,
      },
    ],
  };
};

/* ================= DATE FORMAT ================= */
const formatDate = (timestamp: Timestamp) => {
  return timestamp.toDate().toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

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
  const [range, setRange] = useState<TimeRange>("7d");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, "incidents"), where("status", "==", "เสร็จสิ้น"));
        const snap = await getDocs(q);
        setIncidents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Incident)));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ================= FILTER BY TIME ================= */
  const filteredIncidents = useMemo(() => {
    const days = timeRanges.find((t) => t.value === range)?.days ?? 7;
    const limitTime = Date.now() - days * 24 * 60 * 60 * 1000;

    return incidents.filter((i) => i.createdAt.toMillis() >= limitTime);
  }, [incidents, range]);

  return (
    <Box minHeight="100vh" bgcolor={theme.palette.background.default}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h4" fontWeight={800} mb={3}>
            ประวัติและสถิติเหตุการณ์
          </Typography>

          {/* ===== Time Filter ===== */}
          <Stack direction="row" justifyContent="flex-end" mb={3} flexWrap="wrap" spacing={1}>
            <ToggleButtonGroup
              value={range}
              exclusive
              onChange={(_, val) => val && setRange(val)}
              size="small"
            >
              {timeRanges.map((t) => (
                <ToggleButton key={t.value} value={t.value}>
                  {t.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          {/* ===== Chart ===== */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            {loading ? (
              <Typography color="text.secondary">กำลังโหลดข้อมูล...</Typography>
            ) : filteredIncidents.length === 0 ? (
              <Typography color="text.secondary">ไม่มีข้อมูลในช่วงเวลาที่เลือก</Typography>
            ) : (
              <Box sx={{ height: 420 }}>
                <Bar
                  data={processDataForChart(filteredIncidents)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: theme.palette.text.primary } },
                      title: {
                        display: true,
                        text: "สรุปจำนวนเหตุการณ์ตามประเภท",
                        color: theme.palette.text.primary,
                        font: { size: 18 },
                      },
                    },
                    scales: {
                      x: { ticks: { color: theme.palette.text.secondary } },
                      y: { ticks: { color: theme.palette.text.secondary } },
                    },
                  }}
                />
              </Box>
            )}
          </Paper>

          {/* ===== Incident List ===== */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              รายการเหตุการณ์ย้อนหลัง
            </Typography>

            {filteredIncidents.length === 0 ? (
              <Typography color="text.secondary">ไม่มีเหตุการณ์ในช่วงเวลาที่เลือก</Typography>
            ) : (
              <Stack spacing={2}>
                {[...filteredIncidents]
                  .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
                  .map((incident) => (
                    <Box key={incident.id}>
                      <Typography fontWeight={600}>
                        {typeLabelTH[incident.type] || incident.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        แจ้งเมื่อ: {formatDate(incident.createdAt)}
                      </Typography>
                      {incident.description && (
                        <Typography variant="body2" mb={0.5}>
                          <strong>รายละเอียด:</strong> {incident.description}
                        </Typography>
                      )}
                      {incident.location && (
                        <Typography variant="body2" mb={0.5}>
                          <strong>สถานที่:</strong> {incident.location}
                        </Typography>
                      )}
                      {incident.contact && (
                        <Typography variant="body2" mb={0.5}>
                          <strong>ข้อมูลติดต่อ:</strong> {incident.contact}
                        </Typography>
                      )}
                      {/* <Chip
                        label={incident.status}
                        color={incident.status === "เสร็จสิ้น" ? "success" : "warning"}
                        size="small"
                        sx={{ mt: 1 }}
                      /> */}
                      <Divider sx={{ mt: 2 }} />
                    </Box>
                  ))}
              </Stack>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
