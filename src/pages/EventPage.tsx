import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Stack,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { alpha } from "@mui/material/styles";
import { where } from "firebase/firestore";

const EVENT_TYPE_TH: Record<string, string> = {
  accident: "อุบัติเหตุ",
  fire: "ไฟไหม้",
  medical: "เหตุฉุกเฉินทางการแพทย์",
  crime: "อาชญากรรม",
  disaster: "ภัยพิบัติ",
  utility: "สาธารณูปโภค",
  flood: "น้ำท่วม",
  electricity: "ไฟฟ้าขัดข้อง",
  water: "น้ำประปาขัดข้อง",
  general: "เหตุทั่วไป",
  other: "อื่น ๆ",
};

const getTypeLabel = (type: string) =>
  EVENT_TYPE_TH[type] || type;

type EventPageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function EventPage({ mode, toggleTheme }: EventPageProps) {
  const theme = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
  const q = query(
    collection(db, "incidents"),
    where("status", "==", "เสร็จสิ้น")
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a: any, b: any) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

      setEvents(data);
      setLoading(false);
    },
    () => setLoading(false)
  );

  return () => unsubscribe();
}, []);

  /* ✅ ดึงหมวด + เรียง other ไปล่างสุด */
  const categories = Array.from(
    new Set(events.map((ev) => ev.type))
  ).sort((a, b) => {
    if (a === "other") return 1;
    if (b === "other") return -1;
    return a.localeCompare(b);
  });

  /* ✅ filter ตามหมวดที่เลือก */
  const filteredEvents =
    selectedType === "all"
      ? events
      : events.filter((ev) => ev.type === selectedType);

  if (loading) {
    return (
      <>
        <Navbar mode={mode} toggleTheme={toggleTheme} />
        <Box
          sx={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            bgcolor: "background.default",
          }}
        >
          <CircularProgress size={48} />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Box
        sx={{
          minHeight: "100vh",
          py: 10,
          bgcolor: alpha(theme.palette.background.default, 0.95),
        }}
      >
        <Container maxWidth="md">
          {/* Header */}
          <Stack spacing={1.5} alignItems="center" mb={4}>
            <ReportProblemRoundedIcon color="primary" sx={{ fontSize: 42 }} />
            <Typography variant="h4" fontWeight={800}>
              เหตุการณ์ในพื้นที่
            </Typography>
            <Typography color="text.secondary">
              ติดตามและแจ้งเหตุการณ์แบบเรียลไทม์
            </Typography>
          </Stack>

          {/* 🔽 Filter มุมขวาบน */}
          <Stack direction="row" justifyContent="flex-end" mb={4}>
            <FormControl
              size="small"
              sx={{
                minWidth: 220,
                bgcolor: alpha(theme.palette.background.paper, 0.85),
                borderRadius: 2,
              }}
            >
              <InputLabel>หมวดเหตุการณ์</InputLabel>
              <Select
                label="หมวดเหตุการณ์"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                {categories.map((type) => (
                  <MenuItem key={type} value={type}>
                    {getTypeLabel(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Empty */}
          {filteredEvents.length === 0 && (
            <Typography textAlign="center" color="text.secondary" mt={6}>
              ไม่มีเหตุการณ์ในหมวดนี้
            </Typography>
          )}

          {/* Event list */}
          <Stack spacing={3}>
            {filteredEvents.map((ev, index) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(6px)",
                    transition: "all .25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[6],
                    },
                  }}
                >
                  {/* Type */}
                  <Typography fontWeight={700} color="primary" sx={{ mb: 1 }}>
                    {getTypeLabel(ev.type)}
                  </Typography>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Description */}
                  <Typography sx={{ mb: 1.5 }}>
                    {ev.description}
                  </Typography>

                  {/* Meta */}
                  <Stack spacing={0.8}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOnRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {ev.location}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {ev.contact || "-"}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeRoundedIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {ev.createdAt?.toDate
                          ? ev.createdAt.toDate().toLocaleString("th-TH")
                          : "-"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </motion.div>
            ))}
          </Stack>
        </Container>
      </Box>
    </>
  );
}
