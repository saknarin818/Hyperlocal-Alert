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
import { db, storage } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { useTheme } from "@mui/material/styles";

/* ================== TYPES ================== */
type PageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

/* ================== CONSTANTS ================== */
const incidentTypes = [
  { value: "fire", label: "ไฟไหม้" },
  { value: "accident", label: "อุบัติเหตุ" },
  { value: "crime", label: "อาชญากรรม" },
  { value: "other", label: "อื่น ๆ" },
];

/* ================== LEAFLET ICON FIX ================== */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/* ================== LOCATION PICKER ================== */
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

/* ================== MAIN PAGE ================== */
export default function ReportIncidentPage({ mode, toggleTheme }: PageProps) {
  const theme = useTheme();

  const [form, setForm] = useState({
    type: "",
    description: "",
    location: "",
    contact: "",
  });

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ========== Reverse Geocoding ========== */
  useEffect(() => {
    if (!position) return;

    const fetchAddress = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json&accept-language=th`
        );
        const data = await res.json();
        if (data?.display_name) {
          setForm((prev) => ({ ...prev, location: data.display_name }));
        }
      } catch (err) {
        console.error("Reverse geocode error:", err);
      }
    };

    fetchAddress();
  }, [position]);

  /* ========== Handlers ========== */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.type || !form.description || !form.location) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (!position) {
      alert("กรุณาเลือกตำแหน่งบนแผนที่");
      return;
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      alert("ขนาดรูปต้องไม่เกิน 5MB");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      /* Upload Image */
      if (imageFile) {
        const imageRef = ref(
          storage,
          `incidents/${Date.now()}-${crypto.randomUUID()}`
        );
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      /* Save Firestore */
      await addDoc(collection(db, "incidents"), {
        ...form,
        imageUrl,
        coordinates: {
          lat: position[0],
          lng: position[1],
        },
        status: "กำลังตรวจสอบ",
        createdAt: Timestamp.now(),
      });

      alert("ส่งข้อมูลเรียบร้อยแล้ว");

      setForm({ type: "", description: "", location: "", contact: "" });
      setPosition(null);
      setImageFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Submit error:", error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  /* ================== UI ================== */
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
                  คลิกบนแผนที่เพื่อเลือกตำแหน่ง
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

                <TextField
                  type="file"
                  inputProps={{ accept: "image/*" }}
                  fullWidth
                  margin="normal"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const files = e.target.files;
                    if (files && files[0]) {
                      const file = files[0];
                      setImageFile(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />

                {preview && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <img
                      src={preview}
                      alt="preview"
                      style={{ maxWidth: "100%", borderRadius: 8 }}
                    />
                  </Box>
                )}

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
