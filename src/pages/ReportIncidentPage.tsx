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
  CircularProgress,
  Tooltip,
} from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import MyLocationIcon from "@mui/icons-material/MyLocation"; // 🔹 1. นำเข้าไอคอน GPS
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"; // 🔹 2. นำเข้า useMap
import { db, storage } from "../firebase";
import { collection, addDoc, Timestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { useTheme, alpha } from "@mui/material/styles";
import { useAuth } from "../context/AuthContext";

/* ================== TYPES ================== */
type PageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

/* ================== LEAFLET ICON FIX ================== */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
});

/* ================== LOCATION PICKER ================== */
function LocationPicker({ setPosition }: { setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/* ================== MAP UPDATER (ทำให้กล้องเลื่อนตาม GPS) ================== */
// 🔹 3. ฟังก์ชันสำหรับเลื่อนแผนที่แบบสมูท
function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { animate: true, duration: 1.5 }); 
    }
  }, [center, map]);
  return null;
}

/* ================== MAIN PAGE ================== */
export default function ReportIncidentPage({ mode, toggleTheme }: PageProps) {
  const theme = useTheme();
  const isDark = mode === "dark";
  
  const { user } = useAuth();

  const [form, setForm] = useState({
    type: "",
    description: "",
    location: "",
    contact: "",
  });

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([18.8976, 99.0157]); // 🔹 4. ค่าเริ่มต้นตำแหน่งแผนที่
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false); // 🔹 5. สถานะโหลด GPS
  
  const [incidentTypes, setIncidentTypes] = useState<{ id: string; label: string }[]>([]);

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      color: isDark ? "#fff" : "inherit",
      "& fieldset": { borderColor: isDark ? "#334155" : "rgba(0, 0, 0, 0.23)" },
      "&:hover fieldset": { borderColor: "#38bdf8" },
      "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
    },
    "& .MuiInputLabel-root": { color: isDark ? "#94a3b8" : "text.secondary" },
  };

  // 🔹 6. ฟังก์ชันดึงพิกัด GPS
  const getUserLocation = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]); // ปักหมุด
          setMapCenter([latitude, longitude]); // เลื่อนกล้อง
          setGpsLoading(false);
        },
        (err) => {
          console.error("GPS Error:", err);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true } // ขอความแม่นยำสูง
      );
    } else {
      setGpsLoading(false);
    }
  };

  // 🔹 7. สั่งให้ดึง GPS ทันทีที่เข้าหน้านี้
  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "incidentTypes"), orderBy("label", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typesData = snapshot.docs.map(doc => ({
        id: doc.id,
        label: doc.data().label
      }));
      setIncidentTypes(typesData);
    }, (error) => {
      console.error("Error fetching incident types: ", error);
      setIncidentTypes([
        { id: "fire", label: "ไฟไหม้" },
        { id: "accident", label: "อุบัติเหตุ" },
        { id: "other", label: "อื่นๆ" }
      ]);
    });

    return () => unsubscribe();
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.description || !form.location || !position) {
      alert("กรุณากรอกข้อมูลให้ครบและเลือกตำแหน่งบนแผนที่");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const imageRef = ref(storage, `incidents/${Date.now()}-${crypto.randomUUID()}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }
      
      await addDoc(collection(db, "incidents"), {
        ...form,
        imageUrl,
        coordinates: { lat: position[0], lng: position[1] },
        status: "กำลังตรวจสอบ",
        createdAt: Timestamp.now(),
        userId: user?.uid || "anonymous", 
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

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: isDark ? "#0f172a" : "#f8fafc",
      transition: "0.3s"
    }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <Paper 
            elevation={isDark ? 0 : 3}
            sx={{ 
              p: 4, 
              borderRadius: 4,
              bgcolor: isDark ? "#1e293b" : "#fff",
              color: isDark ? "#fff" : "text.primary",
              border: isDark ? "1px solid #334155" : "none"
            }}
          >
            <Typography variant="h5" fontWeight={800} mb={1} color={isDark ? "#38bdf8" : "primary"}>
              แจ้งเหตุการณ์
            </Typography>
            <Typography variant="body2" color={isDark ? "#94a3b8" : "text.secondary"} mb={3}>
              กรุณากรอกรายละเอียดเหตุการณ์เพื่อแจ้งเตือนคนในชุมชน
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
                sx={inputStyle}
              >
                {incidentTypes.map((opt) => (
                  <MenuItem key={opt.id} value={opt.label}>
                    {opt.label}
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
                sx={inputStyle}
              />

              <TextField
                label="ช่องทางติดต่อ (เบอร์โทร, Line, FB)"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={inputStyle}
              />

              <TextField
                label="สถานที่ (ระบุชื่อที่ตั้ง หรือคลิกบนแผนที่)"
                name="location"
                value={form.location}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                sx={inputStyle}
              />

              {/* 🔹 8. จัดหน้าตาแผนที่และปุ่ม GPS ใหม่ให้อยู่คู่กัน */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2, mb: 1 }}>
                <Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold" }}>
                  📍 ระบุตำแหน่งเกิดเหตุ
                </Typography>
                <Tooltip title="ดึงตำแหน่งปัจจุบันของคุณ">
                  <Button 
                    size="small" 
                    variant="outlined"
                    disabled={gpsLoading}
                    startIcon={gpsLoading ? <CircularProgress size={16} color="inherit" /> : <MyLocationIcon />}
                    onClick={getUserLocation}
                    sx={{ borderRadius: "999px", textTransform: "none", fontSize: "0.8rem", py: 0.5 }}
                  >
                    ตำแหน่งของฉัน
                  </Button>
                </Tooltip>
              </Box>

              <Box sx={{ 
                height: 280, 
                mt: 1, 
                borderRadius: 3, 
                overflow: "hidden",
                border: isDark ? "2px solid #334155" : "1px solid #ddd"
              }}>
                <MapContainer
                  center={mapCenter} // 🔹 ใช้ mapCenter
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapUpdater center={mapCenter} /> {/* 🔹 Component ให้กล้องเลื่อนตาม */}
                  <LocationPicker setPosition={setPosition} />
                  {position && <Marker position={position} />}
                </MapContainer>
              </Box>

              <Box mt={4}>
                <Typography fontWeight={600} mb={1.5} color={isDark ? "#fff" : "text.primary"}>
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
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{ cursor: "pointer", display: "block" }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      borderStyle: "dashed",
                      borderWidth: 2,
                      textAlign: "center",
                      borderColor: isDark ? "#334155" : "#ddd",
                      bgcolor: preview ? "transparent" : (isDark ? alpha("#38bdf8", 0.05) : alpha(theme.palette.primary.main, 0.05)),
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
                      <Stack alignItems="center" spacing={1.5} py={2}>
                        <PhotoCameraRoundedIcon sx={{ fontSize: 40, color: isDark ? "#38bdf8" : "text.secondary" }} />
                        <Typography color={isDark ? "#94a3b8" : "text.secondary"}>
                          คลิกเพื่ออัปโหลดรูปภาพ
                        </Typography>
                        <Typography variant="caption" color={isDark ? "#64748b" : "text.secondary"}>
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
                disabled={loading}
                sx={{ 
                  mt: 5, 
                  py: 1.6, 
                  borderRadius: "999px",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" }
                }}
              >
                {loading ? <CircularProgress size={26} color="inherit" /> : "ส่งข้อมูลแจ้งเหตุ"}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}