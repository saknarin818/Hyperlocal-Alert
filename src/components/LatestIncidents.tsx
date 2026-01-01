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
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  where,
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

const INCIDENT_TYPE_TH: Record<string, string> = {
  fire: "ไฟไหม้",
  accident: "อุบัติเหตุ",
  crime: "อาชญากรรม",
  flood: "น้ำท่วม",
  earthquake: "แผ่นดินไหว",
  other: "เหตุการณ์อื่น ๆ",
};

export default function LatestIncidents() {
  const theme = useTheme();
  const [latestEvents, setLatestEvents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMap, setOpenMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    // Optimized query: filter, order, and limit directly in Firestore
    const q = query(
      collection(db, "incidents"),
      where("status", "==", "เสร็จสิ้น"), // <-- กรองเอาเฉพาะ status "เสร็จสิ้น"
      orderBy("createdAt", "desc"),      // เรียงจากใหม่ไปเก่า
      limit(3)                           // เอาแค่ 3 รายการ
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
      setLatestEvents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Container sx={{ py: { xs: 6, md: 7 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          gutterBottom
        >
          เหตุการณ์ล่าสุดในพื้นที่
        </Typography>

        <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 3 }}>
          {latestEvents.length === 0 ? (
            <Typography textAlign="center" color="text.secondary">
              ยังไม่มีเหตุการณ์ล่าสุด
            </Typography>
          ) : (
            latestEvents.map((ev, index) => (
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
            ))
          )}
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
    </>
  );
}