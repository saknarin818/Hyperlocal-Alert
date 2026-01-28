import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { alpha, useTheme } from "@mui/material/styles";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ================= FIX LEAFLET ICON ================= */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
});

/* ================= TYPES ================= */

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

/* ================= ล่าสุดภายใน 24 ชม. ================= */
const isNewIncident = (createdAt?: Timestamp) => {
  if (!createdAt) return false;
  const now = new Date();
  const created = createdAt.toDate();
  return (now.getTime() - created.getTime()) / (1000 * 60 * 60) <= 24;
};

/* ================= COMPONENT ================= */

export default function LatestIncidents() {
  const theme = useTheme();
  const markerRef = useRef<L.Marker | null>(null);

  const [events, setEvents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // popup states
  const [openDetail, setOpenDetail] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const [openMap, setOpenMap] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<Incident | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mapCoords, setMapCoords] =
    useState<{ lat: number; lng: number } | null>(null);

  /* ================= FIRESTORE ================= */

  useEffect(() => {
    const q = query(
      collection(db, "incidents"),
      where("status", "==", "เสร็จสิ้น"),
      orderBy("createdAt", "desc"),
      limit(3)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          coordinates:
            d.coordinates &&
            typeof d.coordinates.lat === "number" &&
            typeof d.coordinates.lng === "number"
              ? { lat: d.coordinates.lat, lng: d.coordinates.lng }
              : null,
        };
      }) as Incident[];

      setEvents(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* ================= AUTO OPEN MAP POPUP ================= */
  useEffect(() => {
    if (openMap && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [openMap]);

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  /* ================= UI ================= */

  return (
    <>
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={4}>
          เหตุการณ์ล่าสุดในพื้นที่
        </Typography>

        {/* ===== LIST ===== */}
        <Box display="flex" flexDirection="column" gap={3}>
          {events.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedEvent(item);
                  setOpenDetail(true);
                }}
              >
                {/* ===== BADGE ล่าสุด ===== */}
                {isNewIncident(item.createdAt) && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(211,47,47,.95)",
                      color: "#fff",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "999px",
                      zIndex: 2,
                    }}
                  >
                    <Typography variant="caption" fontWeight={700}>
                      ล่าสุด!
                    </Typography>
                  </Box>
                )}

                <CardContent>
                  <Typography variant="caption" color="primary">
                    เหตุการณ์
                  </Typography>

                  <Typography variant="h6" fontWeight={700} mt={1}>
                    {INCIDENT_TYPE_TH[item.type] ?? item.type}
                  </Typography>

                  <Typography color="text.secondary" mb={2}>
                    {item.description}
                  </Typography>

                  {item.imageUrl && (
                    <Box
                      component="img"
                      src={item.imageUrl}
                      sx={{
                        width: "100%",
                        maxHeight: 260,
                        objectFit: "cover",
                        borderRadius: 2,
                        mb: 2,
                      }}
                    />
                  )}

                  {item.coordinates && (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: "999px", mb: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMapCoords(item.coordinates!);
                        setSelectedEvent(item);
                        setOpenMap(true);
                      }}
                    >
                      🗺️ ดูแผนที่
                    </Button>
                  )}

                  <Typography variant="body2">
                    📍 {item.location}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    textAlign="right"
                    mt={1}
                  >
                    {item.createdAt?.toDate().toLocaleString("th-TH")}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>

        {/* ===== VIEW ALL ===== */}
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

      {/* ================= DETAIL POPUP ================= */}
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
                {INCIDENT_TYPE_TH[selectedEvent.type] ?? selectedEvent.type}
              </Typography>

              {/* ===== DESCRIPTION ===== */}
              <Typography variant="caption" color="primary" fontWeight={700} display="block" mt={2}>
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

              {/* ===== STATUS ===== */}
              {selectedEvent.status && (
                <>
                  <Typography variant="caption" color="primary" fontWeight={700} display="block">
                    สถานะ
                  </Typography>
                  <Box
                    sx={{
                      display: "inline-block",
                      px: 2,
                      py: 0.5,
                      borderRadius: "999px",
                      background: selectedEvent.status === "เสร็จสิ้น" ? "rgba(76,175,80,.15)" : "rgba(255,152,0,.15)",
                      mb: 2,
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      fontWeight={700}
                      sx={{
                        color: selectedEvent.status === "เสร็จสิ้น" ? "#4CAF50" : "#FF9800",
                      }}
                    >
                      {selectedEvent.status}
                    </Typography>
                  </Box>
                </>
              )}

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

      {/* ================= IMAGE POPUP ================= */}
      <Dialog
        open={openImage}
        onClose={() => setOpenImage(false)}
        maxWidth="md"
        fullWidth
        disableScrollLock
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <IconButton
            onClick={() => setOpenImage(false)}
            sx={{ position: "absolute", right: 8, top: 8, zIndex: 1 }}
          >
            <CloseIcon />
          </IconButton>

          {imagePreview && (
            <Box
              component="img"
              src={imagePreview}
              sx={{
                width: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ================= MAP POPUP ================= */}
      <Dialog
        open={openMap}
        onClose={() => setOpenMap(false)}
        maxWidth="md"
        fullWidth
        disableScrollLock
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
          {mapCoords && selectedEvent && (
            <Box sx={{ height: 400 }}>
              <MapContainer
                center={[mapCoords.lat, mapCoords.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[mapCoords.lat, mapCoords.lng]}
                  ref={markerRef}
                >
                  <Popup>
                    <strong>
                      {INCIDENT_TYPE_TH[selectedEvent.type]}
                    </strong>
                    <br />
                    {selectedEvent.location}
                  </Popup>
                </Marker>
              </MapContainer>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
