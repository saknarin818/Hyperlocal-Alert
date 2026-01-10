import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Icons
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseIcon from "@mui/icons-material/Close";

// Firebase
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

// Components
import Navbar from "../components/Navbar";

// Leaflet
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* -------------------- TYPE -------------------- */
type Incident = {
  id: string;
  type: string;
  description: string;
  location?: string;
  contact?: string;
  imageUrl?: string; // ✅ รูปภาพ
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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            mb={4}
          >
            <TextField
              fullWidth
              size="small"
              label="ค้นหาเหตุการณ์"
              placeholder="ประเภท / รายละเอียด / สถานที่"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <FormControl size="small" sx={{ minWidth: 220 }}>
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

          {/* List */}
          <Stack spacing={4}>
            {filteredEvents.map((ev, index) => {
              const hasCoords =
                ev.coordinates?.lat && ev.coordinates?.lng;

              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Paper
                    sx={{
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: "divider",
                      overflow: "hidden",
                    }}
                  >
                    <Box p={3}>
                      <Typography variant="h6" fontWeight={800}>
                        {getTypeLabel(ev.type)}
                      </Typography>

                      <Typography mt={1} mb={2}>
                        {ev.description}
                      </Typography>

                      {/* Image */}
                      {ev.imageUrl && (
                        <Box
                          component="img"
                          src={ev.imageUrl}
                          alt="incident"
                          sx={{
                            width: "100%",
                            maxHeight: 260,
                            objectFit: "cover",
                            borderRadius: 2,
                            mb: 2,
                          }}
                        />
                      )}

                      {hasCoords && (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mb: 2, borderRadius: "999px" }}
                          onClick={() => {
                            setMapCoords(ev.coordinates!);
                            setOpenMap(true);
                          }}
                        >
                          🗺️ ดูแผนที่
                        </Button>
                      )}

                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1}>
                          <LocationOnRoundedIcon fontSize="small" />
                          <Typography variant="body2">
                            {ev.location || "-"}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <PhoneRoundedIcon fontSize="small" />
                          <Typography variant="body2">
                            {ev.contact || "-"}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <AccessTimeRoundedIcon fontSize="small" />
                          <Typography variant="caption">
                            {ev.createdAt?.toDate
                              ? ev.createdAt
                                  .toDate()
                                  .toLocaleString("th-TH")
                              : "-"}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </Paper>
                </motion.div>
              );
            })}
          </Stack>
        </Container>
      </Box>

      {/* MAP DIALOG */}
      <Dialog
        open={openMap}
        onClose={() => setOpenMap(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          ตำแหน่งเหตุการณ์
          <IconButton
            onClick={() => setOpenMap(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {mapCoords && (
            <Box sx={{ height: 420, borderRadius: 2, overflow: "hidden" }}>
              <MapContainer
                center={[mapCoords.lat, mapCoords.lng]}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[mapCoords.lat, mapCoords.lng]}
                />
              </MapContainer>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
