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
// นำเข้าเฉพาะ db ไม่ต้องใช้ storage
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";

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
function LocationPicker({ setPosition }: { setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function ReportIncidentPage() {
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

  // handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.description || !form.location) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ประเภท, รายละเอียด, สถานที่)");
      return;
    }
    setLoading(true);

    try {
      // บันทึกข้อมูลทั้งหมดลง Firestore (ไม่มีส่วนของรูปภาพ)
      await addDoc(collection(db, "incidents"), {
        type: form.type,
        description: form.description,
        location: form.location,
        contact: form.contact,
        coordinates: position,
        createdAt: Timestamp.now(),
        status: "กำลังตรวจสอบ",
      });

      alert("ส่งข้อมูลเรียบร้อยแล้ว!");
      // ล้างฟอร์ม
      setForm({ type: "", description: "", location: "", contact: "" });
      setPosition(null);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundImage: `url("/images/bgreport.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          position: "relative",
        }}
      >
        {/* Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.2)",
            zIndex: 0,
          }}
        />

        <Container maxWidth="sm" sx={{ py: 6, position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Paper
              elevation={5}
              sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Box component="form" onSubmit={handleSubmit} noValidate>
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
                  {incidentTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="รายละเอียดเหตุการณ์"
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
                  label="สถานที่เกิดเหตุ (คำอธิบาย)"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                />

                {/* แผนที่ */}
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 250, sm: 300 },
                    borderRadius: "12px",
                    overflow: "hidden",
                    mt: 2,
                  }}
                >
                  <MapContainer
                    center={[18.8976, 99.0157]}
                    zoom={15}
                    style={{ height: "300px", borderRadius: "12px" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                    />
                    <LocationPicker setPosition={setPosition} />
                    {position && <Marker position={position}></Marker>}
                  </MapContainer>
                </Box>

                <TextField
                  label="ข้อมูลติดต่อ (ถ้ามี)"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 3, borderRadius: "2rem" }}
                  disabled={loading}
                >
                  {loading ? "กำลังส่ง..." : "ส่งข้อมูล"}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  color="warning"
                  fullWidth
                  sx={{ mt: 2, borderRadius: "2rem" }}
                  onClick={() => {
                    setForm({ type: "", description: "", location: "", contact: "" });
                    setPosition(null);
                  }}
                >
                  ล้างข้อมูล
                </Button>

                <Button
                  type="button"
                  variant="text"
                  color="primary"
                  fullWidth
                  sx={{ mt: 3, borderRadius: "2rem" }}
                  onClick={() => (window.location.href = "/")}
                >
                  กลับหน้าหลัก
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
