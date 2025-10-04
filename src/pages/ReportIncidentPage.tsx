import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  MenuItem,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

import L from "leaflet";

const incidentTypes = [
  { value: "fire", label: "ไฟไหม้" },
  { value: "accident", label: "อุบัติเหตุ" },
  { value: "crime", label: "อาชญากรรม" },
  { value: "other", label: "อื่น ๆ" },
];

// ตั้งค่าไอคอนของ Marker (ป้องกัน error ไอคอนไม่แสดง)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

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

export default function ReportIncidentPage() {
  const [form, setForm] = useState({
    type: "",
    description: "",
    location: "",
    contact: "",
  });

  const [position, setPosition] = useState<[number, number] | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `ส่งข้อมูลเรียบร้อยแล้ว!\n\nพิกัด: ${
        position ? position.join(", ") : "ไม่ได้เลือก"
      }`
    );
    setForm({ type: "", description: "", location: "", contact: "" });
    setPosition(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
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

              {/* 🗺️ แผนที่เลือกจุด */}
              {/* <Box
                sx={{
                  width: "100%",
                  height: { xs: 250, sm: 300 },
                  borderRadius: "12px",
                  overflow: "hidden",
                  mt: 2,
                }}
              >
                <MapContainer
                  center={[18.7953, 98.9986]} // ค่าเริ่มต้น (เชียงใหม่)
                  zoom={13}
                  style={{ height: "300px", borderRadius: "12px" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                  />
                  <LocationPicker setPosition={setPosition} />
                  {position && <Marker position={position}></Marker>}
                </MapContainer>
              </Box> */}

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
              >
                ส่งข้อมูล
              </Button>

              <Button
                type="button"
                variant="outlined"
                color="warning"
                fullWidth
                sx={{ mt: 2, borderRadius: "2rem" }}
                onClick={() => {
                  setForm({
                    type: "",
                    description: "",
                    location: "",
                    contact: "",
                  });
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

      <Box sx={{ py: 4, textAlign: "center", bgcolor: "#f3f4f6", mt: "auto" }}>
        <Typography variant="body2" color="textSecondary">
          © 2025 Hyperlocal Community Alert System
        </Typography>
      </Box>
    </Box>
  );
}
