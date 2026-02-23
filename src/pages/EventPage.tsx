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
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

// Icons
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

  const [events, setEvents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [searchText, setSearchText] = useState("");

  // Map dialog
  const [openMap, setOpenMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // Detail dialog
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Incident | null>(null);

  /* -------------------- FETCH -------------------- */
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

      setEvents(
        data.sort((a, b) => {
          const ta =
            a.createdAt?.toMillis?.() ??
            (a.createdAt?.seconds ?? 0) * 1000;
          const tb =
            b.createdAt?.toMillis?.() ??
            (b.createdAt?.seconds ?? 0) * 1000;
          return tb - ta;
        })
      );

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* -------------------- FILTER -------------------- */
  const categories = Array.from(new Set(events.map((ev) => ev.type)));

  const filteredEvents = events.filter((ev) => {
    const matchType =
      selectedType === "all" || ev.type === selectedType;

    const keyword = searchText.toLowerCase();

    const matchSearch =
      getTypeLabel(ev.type).toLowerCase().includes(keyword) ||
      ev.description.toLowerCase().includes(keyword) ||
      (ev.location ?? "").toLowerCase().includes(keyword);

    return matchType && matchSearch;
  });

  /* -------------------- LOADING -------------------- */
  if (loading) {
    return (
      <>
        <Navbar mode={mode} toggleTheme={toggleTheme} />
        <Box
          sx={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress size={48} />
        </Box>
      </>
    );
  }

  /* -------------------- RENDER -------------------- */
  return (
    <>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Box py={10} bgcolor={alpha(theme.palette.background.default, 0.95)}>
        <Container maxWidth="md">
          {/* Back Button */}
          {/* <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/")}
            sx={{
              mb: 3,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            กลับไปหน้าหลัก
          </Button> */}

          {/* Header */}
          <Stack spacing={1.5} alignItems="center" mb={5}>
            <ReportProblemRoundedIcon color="primary" sx={{ fontSize: 42 }} />
            <Typography variant="h4" fontWeight={800}>
              เหตุการณ์ในพื้นที่
            </Typography>
            <Typography color="text.secondary">
              ติดตามเหตุการณ์แบบเรียลไทม์
            </Typography>
          </Stack>

          {/* Search + Filter */}
          <EventFilter
            searchText={searchText}
            selectedType={selectedType}
            categories={categories}
            onSearchChange={setSearchText}
            onTypeChange={setSelectedType}
            getTypeLabel={getTypeLabel}
          />

          {/* List */}
          <Stack spacing={4}>
            {filteredEvents.map((ev, index) => (
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
            ))}
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
      >
        <DialogTitle>
          รายละเอียดเหตุการณ์
          <IconButton
            onClick={() => setOpenDetail(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedEvent && (
            <>
              {/* ===== IMAGE ===== */}
              {selectedEvent.imageUrl && (
                <Box
                  component="img"
                  src={selectedEvent.imageUrl}
                  sx={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "cover",
                    borderRadius: 2,
                    mb: 2,
                  }}
                />
              )}

              {/* ===== TYPE ===== */}
              <Typography variant="caption" color="primary" fontWeight={700}>
                ประเภทเหตุการณ์
              </Typography>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {getTypeLabel(selectedEvent.type)}
              </Typography>

              {/* ===== DESCRIPTION ===== */}
              <Typography
                variant="caption"
                color="primary"
                fontWeight={700}
                display="block"
                mt={2}
              >
                รายละเอียด
              </Typography>
              <Typography variant="body2" mb={2} sx={{ whiteSpace: "pre-wrap" }}>
                {selectedEvent.description}
              </Typography>

              {/* ===== LOCATION ===== */}
              <Typography variant="caption" color="primary" fontWeight={700} display="block">
                📍 ที่ตั้ง
              </Typography>
              <Typography variant="body2" mb={2}>
                {selectedEvent.location}
              </Typography>

              {/* ===== CONTACT ===== */}
              <Typography variant="caption" color="primary" fontWeight={700} display="block">
                📞 ติดต่อ
              </Typography>
              <Typography variant="body2" mb={2}>
                {selectedEvent.contact || "-"}
              </Typography>

              {/* ===== DATE ===== */}
              {selectedEvent.createdAt && (
                <>
                  <Typography variant="caption" color="primary" fontWeight={700} display="block">
                    เวลาที่รายงาน
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {selectedEvent.createdAt.toDate().toLocaleString("th-TH")}
                  </Typography>
                </>
              )}

              {/* ===== VIEW MAP ===== */}
              {selectedEvent.coordinates && (
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ borderRadius: 2, mt: 2 }}
                  onClick={() => {
                    setMapCoords(selectedEvent.coordinates!);
                    setOpenDetail(false);
                    setTimeout(() => setOpenMap(true), 300);
                  }}
                >
                  🗺️ ดูแผนที่ตำแหน่ง
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
