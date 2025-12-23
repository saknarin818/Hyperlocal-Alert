import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { useTheme } from "@mui/material/styles";

type PageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

// ประเภทเหตุการณ์
const incidentTypes = [
  { value: "fire", label: "ไฟไหม้" },
  { value: "accident", label: "อุบัติเหตุ" },
  { value: "crime", label: "อาชญากรรม" },
  { value: "other", label: "อื่น ๆ" },
];

// ตั้งค่า Marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Component สำหรับเลือกพิกัด
function LocationPicker({
  setPosition,
}: {
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function ReportIncidentPage({
  mode,
  toggleTheme,
}: PageProps) {
  const theme = useTheme();

  const [form, setForm] = useState({
    type: "",
    description: "",
    location: "",
    contact: "",
  });

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);

  // Reverse geocoding
  useEffect(() => {
    const fetchAddress = async () => {
      if (!position) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json&accept-language=th`
        );
        const data = await res.json();
        if (data?.display_name) {
          setForm((prev) => ({ ...prev, location: data.display_name }));
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    };
    fetchAddress();
  }, [position]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ แก้ตรงนี้ตามที่ขอ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.type || !form.description || !form.location) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบ");
      return;
    }

    if (!position) {
      alert("กรุณาคลิกเลือกตำแหน่งบนแผนที่");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "incidents"), {
        ...form,
        coordinates: {
          lat: position[0],
          lng: position[1],
        },
        createdAt: Timestamp.now(),
        status: "กำลังตรวจสอบ",
      });

      alert("ส่งข้อมูลเรียบร้อยแล้ว!");
      setForm({ type: "", description: "", location: "", contact: "" });
      setPosition(null);
    } catch (error) {
      console.error("Firestore error:", error);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Box sx={{ flex: 1, bgcolor: "background.default" }}>
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                แจ้งเหตุการณ์
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  select
                  label="ประเภทเหตุการณ์"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                >
                  {incidentTypes.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="รายละเอียด"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  fullWidth
                  required
                  multiline
                  rows={3}
                  margin="normal"
                />

                <TextField
                  label="สถานที่"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  กรุณาคลิกบนแผนที่เพื่อเลือกตำแหน่งเหตุการณ์
                </Typography>

                <Box sx={{ height: 300, mt: 1 }}>
                  <MapContainer
                    center={[18.8976, 99.0157]}
                    zoom={15}
                    style={{ height: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker setPosition={setPosition} />
                    {position && <Marker position={position} />}
                  </MapContainer>
                </Box>

                <TextField
                  label="ข้อมูลติดต่อ"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 3 }}
                  disabled={loading}
                >
                  {loading ? "กำลังส่ง..." : "ส่งข้อมูล"}
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
