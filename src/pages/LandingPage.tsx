import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Box,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { alpha } from "@mui/material/styles";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* FIX leaflet icon */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
});

/* props จาก App */
type LandingPageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  status?: string;
  createdAt?: Timestamp;
  imageUrl?: string | null;
  coordinates?: { lat: number; lng: number } | null;
}

export default function LandingPage({ mode, toggleTheme }: LandingPageProps) {
  const theme = useTheme();
  const [latestEvents, setLatestEvents] = useState<Incident[]>([]);
  const [openMap, setOpenMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "incidents"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Incident[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          type: d.type,
          description: d.description,
          location: d.location,
          status: d.status,
          createdAt: d.createdAt,
          imageUrl: d.imageUrl ?? null,
          coordinates:
            d.coordinates &&
            typeof d.coordinates.lat === "number" &&
            typeof d.coordinates.lng === "number"
              ? { lat: d.coordinates.lat, lng: d.coordinates.lng }
              : null,
        };
      });

      const approved = data.filter((d) => d.status === "เสร็จสิ้น");
      setLatestEvents(approved.slice(0, 3));
    });

    return () => unsubscribe();
  }, []);

  const INCIDENT_TYPE_TH: Record<string, string> = {
    fire: "ไฟไหม้",
    accident: "อุบัติเหตุ",
    crime: "อาชญากรรม",
    flood: "น้ำท่วม",
    earthquake: "แผ่นดินไหว",
    other: "เหตุการณ์อื่น ๆ",
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      {/* HERO */}
      <Container sx={{ py: { xs: 8, md: 9 }, textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h2" fontWeight={800} gutterBottom>
            ระบบแจ้งเตือนเหตุการณ์เฉพาะพื้นที่
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto", mb: 4 }}
          >
            ติดตามเหตุการณ์แบบเรียลไทม์ แจ้งเหตุได้ทันที
            พร้อมรับการแจ้งเตือนในพื้นที่ของคุณ
          </Typography>

          <Button
            component={Link}
            to="/report"
            variant="contained"
            size="large"
            startIcon={<WarningIcon />}
            sx={{ px: 6, py: 2, borderRadius: "999px" }}
          >
            แจ้งเหตุทันที
          </Button>
        </motion.div>
      </Container>

      {/* FEED */}
      <Container sx={{ py: { xs: 6, md: 7 } }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
          เหตุการณ์ล่าสุดในพื้นที่
        </Typography>

        <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 3 }}>
          {latestEvents.map((ev, index) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.background.paper, 0.95),
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: theme.shadows[3],
                }}
              >
                <CardContent>
                  <Typography variant="caption" color="primary">
                    เหตุการณ์
                  </Typography>

                  <Typography variant="h6" fontWeight={700} mt={1}>
                    {INCIDENT_TYPE_TH[ev.type] ?? ev.type}
                  </Typography>

                  <Typography color="text.secondary" mb={2}>
                    {ev.description}
                  </Typography>

                  {/* IMAGE */}
                  {ev.imageUrl && (
                    <Box
                      sx={{
                        position: "relative",
                        height: 240,
                        borderRadius: 3,
                        overflow: "hidden",
                        mb: 2,
                        "& img": {
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform .4s ease",
                        },
                        "&:hover img": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <Box component="img" src={ev.imageUrl} />
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to top, rgba(0,0,0,.55), transparent)",
                        }}
                      />
                    </Box>
                  )}

                  {/* MAP BUTTON */}
                  {ev.coordinates && (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: "999px", mb: 2 }}
                      onClick={() => {
                        setMapCoords(ev.coordinates!);
                        setOpenMap(true);
                      }}
                    >
                      🗺️ ดูแผนที่
                    </Button>
                  )}

                  <Typography variant="body2">📍 {ev.location}</Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", textAlign: "right", mt: 1 }}
                  >
                    {ev.createdAt?.toDate().toLocaleString("th-TH")}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>

        <Box textAlign="center" mt={6}>
          <Button
            component={Link}
            to="/event"
            variant="outlined"
            size="large"
            sx={{ borderRadius: "999px", px: 5 }}
          >
            ดูเหตุการณ์ทั้งหมด
          </Button>
        </Box>
      </Container>

      {/* MAP DIALOG */}
      <Dialog open={openMap} onClose={() => setOpenMap(false)} maxWidth="md" fullWidth>
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
            <Box sx={{ height: 400, borderRadius: 2, overflow: "hidden" }}>
              <MapContainer
                center={[mapCoords.lat, mapCoords.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[mapCoords.lat, mapCoords.lng]} />
              </MapContainer>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* FOOTER */}
      <Box py={4} textAlign="center" bgcolor={alpha(theme.palette.background.paper, 0.8)}>
        <Typography variant="body2" color="text.secondary">
          © 2025 Hyperlocal Community Alert System
        </Typography>
      </Box>
    </Box>
  );
}
