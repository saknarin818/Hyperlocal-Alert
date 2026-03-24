// src/pages/EventPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Stack,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";

// Firebase
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

// Components
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import EventFilter from "../components/EventFilter";
import EventMapDialog from "../components/EventMapDialog";

/* -------------------- TYPE -------------------- */
type Incident = {
  id: string;
  type: string;
  description: string;
  location?: string;
  contact?: string;
  imageUrl?: string; 
  createdAt?: any;
  coordinates?: {
    lat: number;
    lng: number;
  };
  reporterName?: string; // 🔹 เพิ่มบรรทัดนี้
};

/* -------------------- LABEL -------------------- */
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
  other: "เหตุการณ์อื่น ๆ",
};

const getTypeLabel = (type: string) => EVENT_TYPE_TH[type] || type;

/* -------------------- PAGE -------------------- */
type EventPageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function EventPage({ mode, toggleTheme }: EventPageProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // 🔹 ตัวแปรเช็คสถานะธีม
  const isDark = mode === "dark"; 

  const [events, setEvents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [searchText, setSearchText] = useState("");

  // Map dialog control
  const [openMap, setOpenMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Detail dialog control
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Incident | null>(null);

  /* -------------------- FETCH DATA (REAL-TIME) -------------------- */
  useEffect(() => {
    const q = query(
      collection(db, "incidents"),
      where("status", "==", "เสร็จสิ้น")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Incident[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Incident, "id">),
      }));

      // เรียงลำดับจากใหม่ไปเก่า
      setEvents(
        data.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? (a.createdAt?.seconds ?? 0) * 1000;
          const tb = b.createdAt?.toMillis?.() ?? (b.createdAt?.seconds ?? 0) * 1000;
          return tb - ta;
        })
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* -------------------- FILTER LOGIC -------------------- */
  // 🔹 แก้ไขตรรกะ: เรียง 'other' ไว้ล่างสุด และที่เหลือเรียงตามอักษรไทย

  const categories = Array.from(new Set(events.map((ev) => getTypeLabel(ev.type)))).sort((a, b) => {
    const otherLabel = getTypeLabel("other"); // "เหตุการณ์อื่น ๆ"
    if (a === otherLabel) return 1;  // ถ้าเป็น other ให้ไปอยู่หลังสุด
    if (b === otherLabel) return -1; 
    return a.localeCompare(b, "th");
  });

  const filteredEvents = events.filter((ev) => {
    // 🔹 เปลี่ยนมาเทียบ selectedType กับ getTypeLabel(ev.type)
    const matchType = selectedType === "all" || getTypeLabel(ev.type) === selectedType;
    
    const keyword = searchText.toLowerCase();
    const matchSearch =
      getTypeLabel(ev.type).toLowerCase().includes(keyword) ||
      ev.description.toLowerCase().includes(keyword) ||
      (ev.location ?? "").toLowerCase().includes(keyword);

    return matchType && matchSearch;
  });

  /* -------------------- RENDER LOADING -------------------- */
  if (loading) {
    return (
      <Box sx={{ bgcolor: isDark ? "#0f172a" : "#f8fafc", minHeight: "100vh" }}>
        <Navbar mode={mode} toggleTheme={toggleTheme} />
        <Box sx={{ display: "grid", placeItems: "center", mt: 20 }}>
          <CircularProgress size={48} thickness={4} />
          <Typography sx={{ mt: 2, color: isDark ? "#94a3b8" : "text.secondary" }}>
            กำลังโหลดข้อมูลเหตุการณ์...
          </Typography>
        </Box>
      </Box>
    );
  }

  /* -------------------- MAIN UI -------------------- */
  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: isDark ? "#0f172a" : "#f8fafc", 
      color: isDark ? "#fff" : "text.primary",
      transition: "background-color 0.3s ease"
    }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Box py={{ xs: 6, md: 10 }}>
        <Container maxWidth="md">
          {/* Header Section */}
          <Stack spacing={2} alignItems="center" mb={6}>
            <ReportProblemRoundedIcon 
              sx={{ fontSize: 56, color: isDark ? "#38bdf8" : theme.palette.primary.main }} 
            />
            <Typography variant="h3" fontWeight={800} sx={{ 
              color: isDark ? "#38bdf8" : "inherit",
              fontSize: { xs: "2.2rem", md: "2.5rem" }
            }}>
              เหตุการณ์ในพื้นที่
            </Typography>
            <Typography sx={{ color: isDark ? "#94a3b8" : "text.secondary", textAlign: "center" }}>
              ติดตามเหตุการณ์สำคัญในชุมชนของคุณ
            </Typography>
          </Stack>

          {/* Search & Filter Bar */}
          <Paper 
            elevation={isDark ? 0 : 2}
            sx={{ 
              bgcolor: isDark ? "#1e293b" : "#fff", 
              p: { xs: 2, md: 3 }, 
              borderRadius: 4, 
              mb: 6,
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
              boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.05)"
            }}
          >
            <EventFilter
              searchText={searchText}
              selectedType={selectedType}
              categories={categories}
              onSearchChange={setSearchText}
              onTypeChange={setSelectedType}
              getTypeLabel={getTypeLabel}
            />
          </Paper>

          {/* Incidents List */}
          <Stack spacing={4}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((ev, index) => (
                <EventCard
                  key={ev.id}
                  incident={ev}
                  typeLabel={getTypeLabel(ev.type)}
                  index={index}
                  onMapClick={(coords) => {
                    setMapCoords(coords);
                    setOpenMap(true);
                  }}
                  onDetailClick={(incident) => {
                    setSelectedEvent(incident);
                    setOpenDetail(true);
                  }}
                />
              ))
            ) : (
              <Box textAlign="center" py={10}>
                <Typography sx={{ color: "#94a3b8", fontSize: "1.1rem" }}>
                  ไม่พบเหตุการณ์ที่ตรงกับการค้นหาของคุณในขณะนี้
                </Typography>
              </Box>
            )}
          </Stack>
        </Container>
      </Box>

      {/* MAP DIALOG */}
      <EventMapDialog
        open={openMap}
        coordinates={mapCoords}
        onClose={() => setOpenMap(false)}
      />

      {/* DETAIL DIALOG */}
      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        maxWidth="sm"
        fullWidth
        disableScrollLock
        PaperProps={{
          sx: {
            bgcolor: isDark ? "#1e293b" : "#fff",
            color: isDark ? "#fff" : "inherit",
            backgroundImage: "none",
            borderRadius: 4,
            overflow: "hidden"
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 800, 
          fontSize: "1.5rem",
          borderBottom: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          รายละเอียดเหตุการณ์
          <IconButton onClick={() => setOpenDetail(false)} sx={{ color: isDark ? "#94a3b8" : "inherit" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 3, pb: 4 }}>
          {selectedEvent && (
            <Stack spacing={3}>
              {selectedEvent.imageUrl && (
                <Box
                  component="img"
                  src={selectedEvent.imageUrl}
                  sx={{
                    width: "100%",
                    maxHeight: 350,
                    objectFit: "cover",
                    borderRadius: 3,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.3)"
                  }}
                />
              )}

              <Box>
                <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 800, textTransform: "uppercase" }}>
                  ประเภทเหตุการณ์
                </Typography>
                <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: isDark ? "#fff" : "primary.main" }}>
                  {getTypeLabel(selectedEvent.type)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 800 }}>รายละเอียด</Typography>
                <Typography variant="body1" sx={{ 
                  whiteSpace: "pre-wrap", 
                  color: isDark ? "#cbd5e1" : "text.primary",
                  lineHeight: 1.6 
                }}>
                  {selectedEvent.description}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 800 }}>📍 สถานที่</Typography>
                  <Typography variant="body2">{selectedEvent.location || "ไม่ได้ระบุที่ตั้ง"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 800 }}>📞 ข้อมูลติดต่อ</Typography>
                  <Typography variant="body2">{selectedEvent.contact || "-"}</Typography>
                </Box>
                
                {/* 🔹 เพิ่มกล่องแสดงชื่อผู้แจ้งตรงนี้ (ให้กินพื้นที่ 2 คอลัมน์จะได้เต็มบรรทัดสวยงาม) */}
                {/* 🔹 กล่องแสดงชื่อผู้แจ้ง */}
                <Box sx={{ gridColumn: "span 2", mt: 1 }}>
                  <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 800 }}>👤 ผู้แจ้งเหตุ</Typography>
                  <Typography variant="body2">
                    {/* 🔹 ถ้าไม่มีค่า หรือมีค่าเป็นคำว่า "undefined" ให้โชว์คำว่า ผู้ใช้งานทั่วไป แทน */}
                    {!selectedEvent.reporterName || selectedEvent.reporterName === "undefined" 
                      ? "ผู้ใช้งานทั่วไป" 
                      : selectedEvent.reporterName}
                  </Typography>
                </Box>
              </Box>

              {selectedEvent.createdAt && (
                <Box sx={{ p: 2, bgcolor: isDark ? "#334155" : "#f8fafc", borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: 800 }}>
                    รายงานเมื่อวันที่
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedEvent.createdAt.toDate().toLocaleString("th-TH")}
                  </Typography>
                </Box>
              )}

              {selectedEvent.coordinates && (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setMapCoords(selectedEvent.coordinates!);
                    setOpenDetail(false);
                    setTimeout(() => setOpenMap(true), 300);
                  }}
                  sx={{ 
                    borderRadius: "999px", 
                    py: 1.8, 
                    fontWeight: 800,
                    bgcolor: "#2563eb",
                    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
                    "&:hover": { bgcolor: "#1d4ed8" }
                  }}
                >
                  🗺️ แสดงตำแหน่งบนแผนที่
                </Button>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}