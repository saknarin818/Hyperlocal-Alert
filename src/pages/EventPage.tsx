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
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { alpha } from "@mui/material/styles";

// 🗺️ Leaflet
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* -------------------- TYPE -------------------- */
type Incident = {
  id: string;
  type: string;
  description: string;
  location?: string;
  contact?: string;
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
  other: "อื่น ๆ",
};

const getTypeLabel = (type: string) => EVENT_TYPE_TH[type] || type;

/* -------------------- PAGE -------------------- */
type EventPageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function EventPage({ mode, toggleTheme }: EventPageProps) {
  const theme = useTheme();
  const [events, setEvents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");

  /* -------------------- FETCH -------------------- */
  useEffect(() => {
    const q = query(
      collection(db, "incidents"),
      where("status", "==", "เสร็จสิ้น")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Incident[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Incident, "id">),
        }))
        // 🔽 เรียงตรงนี้แทน orderBy
        .sort((a, b) => {
          const ta =
            a.createdAt?.toMillis?.() ??
            (a.createdAt?.seconds ?? 0) * 1000;

          const tb =
            b.createdAt?.toMillis?.() ??
            (b.createdAt?.seconds ?? 0) * 1000;

          return tb - ta;
        });
      setEvents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* -------------------- FILTER -------------------- */
  const categories = Array.from(
    new Set(events.map((ev) => ev.type))
  );

  const filteredEvents =
    selectedType === "all"
      ? events
      : events.filter((ev) => ev.type === selectedType);

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

          {/* Filter */}
          <Stack direction="row" justifyContent="flex-end" mb={4}>
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
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {/* Header */}
                    <Box p={3}>
                      <Typography
                        variant="caption"
                        color="primary"
                        fontWeight={600}
                      >
                        เหตุการณ์
                      </Typography>

                      <Typography variant="h6" fontWeight={800}>
                        {getTypeLabel(ev.type)}
                      </Typography>

                      <Typography mt={1}>
                        {ev.description}
                      </Typography>
                    </Box>

                    {/* Map */}
                    {hasCoords && (
                      <Box height={280}>
                        <MapContainer
                          center={[
                            ev.coordinates!.lat,
                            ev.coordinates!.lng,
                          ]}
                          zoom={16}
                          style={{ height: "100%", width: "100%" }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            attribution="&copy; OpenStreetMap"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker
                            position={[
                              ev.coordinates!.lat,
                              ev.coordinates!.lng,
                            ]}
                          />
                        </MapContainer>
                      </Box>
                    )}

                    {/* Footer */}
                    <Box p={3}>
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
    </>
  );
}
