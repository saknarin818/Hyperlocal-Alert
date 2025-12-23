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
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { alpha } from "@mui/material/styles";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* FIX icon leaflet */
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
              ? {
                lat: d.coordinates.lat,
                lng: d.coordinates.lng,
              }
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

      {/* Background */}
      <Box
        sx={{
          position: "relative",
          bgcolor: theme.palette.background.default,
          minHeight: "100vh", // ให้เต็มหน้าจอ
        }}
      >

        <Box sx={{ position: "relative", zIndex: 1 }}>
          {/* ================= HERO ================= */}
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

          {/* ================= FEED ================= */}
          <Container sx={{ py: { xs: 6, md: 7 } }}>
            <Typography
              variant="h4"
              fontWeight={700}
              textAlign="center"
              gutterBottom
            >
              เหตุการณ์ล่าสุดในพื้นที่
            </Typography>

            {latestEvents.length === 0 && (
              <Typography textAlign="center" color="text.secondary">
                ยังไม่มีรายงานเหตุการณ์
              </Typography>
            )}

            <Box
              sx={{
                mt: 4,
                display: "flex",
                flexDirection: "column", // ให้ Card เรียงเป็นแนวตั้ง
                gap: 3, // ระยะห่างระหว่าง Card
              }}
            >
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
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      border: "1px solid",
                      borderColor: "divider",
                      width: "100%",
                      boxShadow: theme.shadows[3],
                      transition: "all .25s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[6],
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Label */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.primary.main,
                          opacity: 0.7,
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        เหตุการณ์
                      </Typography>

                      {/* Type */}
                      <Typography
                        variant="h6"
                        sx={{
                          mt: 1,
                          mb: 1,
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {INCIDENT_TYPE_TH[ev.type] ?? ev.type}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          mb: 2,
                        }}
                      >
                        {ev.description}
                      </Typography>

                      {/* รูปภาพเหตุการณ์ */}
                      {ev.imageUrl && (
                        <Box
                          component="img"
                          src={ev.imageUrl}
                          alt="incident"
                          sx={{
                            width: "100%",
                            height: 220,
                            objectFit: "cover",
                            borderRadius: 2,
                            mb: 2,
                          }}
                        />
                      )}

                      {/* แผนที่ */}
                      {ev.coordinates && (
                        <Box
                          sx={{
                            height: 220,
                            mb: 2,
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <MapContainer
                            center={[ev.coordinates.lat, ev.coordinates.lng]}
                            zoom={14}
                            style={{ height: "100%", width: "100%" }}
                            scrollWheelZoom={false}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[ev.coordinates.lat, ev.coordinates.lng]} />
                          </MapContainer>
                        </Box>
                      )}

                      {/* Footer */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          mt: 4,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          📍 {ev.location}
                        </Typography>

                        <br></br>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ alignSelf: "flex-end" }}
                        >
                          {ev.createdAt?.toDate
                            ? ev.createdAt
                              .toDate()
                              .toLocaleString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </Typography>
                      </Box>
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

          {/* ================= FOOTER ================= */}
          <Box py={4} textAlign="center" bgcolor={alpha(theme.palette.background.paper, 0.8)}>
            <Typography variant="body2" color="text.secondary">
              © 2025 Hyperlocal Community Alert System
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
