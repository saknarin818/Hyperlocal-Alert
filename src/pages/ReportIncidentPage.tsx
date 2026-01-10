import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  MenuItem,
  Stack,
} from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { db, storage } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { useTheme, alpha } from "@mui/material/styles";

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
  { value: "other", label: "เหตุการณ์อื่น ๆ" },
];

/* ================== LEAFLET ICON FIX ================== */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= Reverse Geocoding ================= */
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
        console.error(err);
      }
    };

    fetchAddress();
  }, [position]);

  /* ================= Handlers ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.type || !form.description || !form.location || !position) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      alert("ขนาดรูปต้องไม่เกิน 5MB");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        const imageRef = ref(
          storage,
          `incidents/${Date.now()}-${crypto.randomUUID()}`
        );
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

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
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Box minHeight="100vh">
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h5" fontWeight={800} mb={2}>
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
                label="ข้อมูลติดต่อ ( ไม่บังคับ )"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                fullWidth
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

              <Typography variant="body2" color="text.secondary" mt={2}>
                คลิกบนแผนที่เพื่อเลือกตำแหน่ง
              </Typography>

              <Box sx={{ height: 280, mt: 1 }}>
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

              {/* ===== MODERN IMAGE UPLOAD ===== */}
              <Box mt={3}>
                <Typography fontWeight={600} mb={1}>
                  รูปภาพเหตุการณ์
                </Typography>

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  id="image-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />

                <motion.label
                  htmlFor="image-upload"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ cursor: "pointer" }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      borderStyle: "dashed",
                      textAlign: "center",
                      bgcolor: preview
                        ? "transparent"
                        : alpha(theme.palette.primary.main, 0.05),
                    }}
                  >
                    {preview ? (
                      <Box
                        component="img"
                        src={preview}
                        sx={{
                          width: "100%",
                          maxHeight: 240,
                          objectFit: "cover",
                          borderRadius: 2,
                        }}
                      />
                    ) : (
                      <Stack alignItems="center" spacing={1.5}>
                        <PhotoCameraRoundedIcon
                          sx={{ fontSize: 40, color: "text.secondary" }}
                        />
                        <Typography color="text.secondary">
                          คลิกเพื่ออัปโหลดรูปภาพ
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          รองรับ JPG, PNG (ไม่เกิน 5MB)
                        </Typography>
                      </Stack>
                    )}
                  </Paper>
                </motion.label>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 4, py: 1.4, borderRadius: 999 }}
                disabled={loading}
              >
                {loading ? "กำลังส่ง..." : "ส่งข้อมูล"}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
