// src/pages/ProfilePage.tsx

import { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  Paper,
  // 🔹 นำเข้าคอมโพเนนต์สำหรับ Dialog
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"; // ไอคอนสำหรับ Dialog
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { registerForPush } from "../pushNotifications";

type Props = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function ProfilePage({ mode, toggleTheme }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [contact, setContact] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔹 State สำหรับเปิด/ปิด Dialog ยืนยันออกจากระบบ
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  // 🔹 ตรวจสอบสถานะธีม
  const isDark = mode === "dark";

  // 🔹 สไตล์สำหรับช่องกรอกข้อมูลที่เปลี่ยนตามธีม
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      color: isDark ? "#fff" : "inherit",
      borderRadius: "8px",
      "& fieldset": { 
        borderColor: isDark ? "#334155" : "rgba(0, 0, 0, 0.23)" 
      },
      "&:hover fieldset": { borderColor: "#38bdf8" },
      "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
    },
    "& .MuiInputLabel-root": { 
      color: isDark ? "#94a3b8" : "text.secondary" 
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#38bdf8" },
    mb: 2.5
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || "");
          setDisplayName(data.displayName || "");
          setContact(data.contact || data.phone || ""); 
          setPhotoURL(data.photoURL || "");
        }
        await registerForPush();
      } catch (err) {
        console.error("Auto-notification setup failed:", err);
        setError("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("ขนาดรูปภาพต้องไม่เกิน 2MB");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });
      setPhotoURL(downloadURL);
      setMessage("อัปโหลดรูปโปรไฟล์สำเร็จ ✨");
    } catch (err) {
      setError("อัปโหลดรูปภาพล้มเหลว");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { displayName, contact });
      setMessage("บันทึกข้อมูลสำเร็จแล้ว ✅");
      setError(null);
    } catch {
      setError("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  // 🔹 ฟังก์ชันนี้จะถูกเรียกเมื่อกดยืนยันใน Dialog
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setOpenLogoutDialog(false);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        bgcolor: isDark ? "#0f172a" : "#f8fafc" 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ 
        minHeight: "100vh", 
        bgcolor: isDark ? "#0f172a" : "#f8fafc", 
        color: isDark ? "#fff" : "text.primary",
        transition: "0.3s"
      }}>
        <Navbar mode={mode} toggleTheme={toggleTheme} />

        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Paper 
            elevation={isDark ? 0 : 3} 
            sx={{ 
              p: 4, 
              borderRadius: 4, 
              bgcolor: isDark ? "#1e293b" : "#fff", 
              color: isDark ? "#fff" : "inherit", 
              border: isDark ? "1px solid #334155" : "none",
              textAlign: "center",
              transition: "0.3s"
            }}
          >
            <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
              <Avatar
                src={photoURL}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: "auto", 
                  border: `4px solid ${isDark ? "#38bdf8" : "#1976d2"}`, 
                  fontSize: "3rem" 
                }}
              >
                {!photoURL && (displayName ? displayName.charAt(0) : "?")}
              </Avatar>
              
              <IconButton
                color="primary"
                component="label"
                sx={{
                  position: "absolute", bottom: 0, right: 0,
                  bgcolor: "#38bdf8", color: "#fff",
                  "&:hover": { bgcolor: "#0ea5e9" },
                  boxShadow: 3
                }}
              >
                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                <PhotoCamera fontSize="small" />
              </IconButton>
            </Box>
            
            {uploading && <CircularProgress size={24} sx={{ mb: 2, display: "block", mx: "auto" }} />}
            
            <Typography variant="h4" fontWeight="bold" sx={{ color: isDark ? "#38bdf8" : "#1976d2" }}>
              {displayName || "ชื่อผู้ใช้งาน"}
            </Typography>
            <Typography variant="body1" sx={{ color: isDark ? "#94a3b8" : "text.secondary", mb: 2 }}>
              {user?.email}
            </Typography>

            <Chip
              label={role === "admin" ? "ผู้ดูแลระบบ" : "สมาชิกทั่วไป"}
              color={role === "admin" ? "error" : "primary"}
              sx={{ fontWeight: "bold", mb: 3 }}
            />

            {message && <Alert severity="success" sx={{ mb: 2, textAlign: "left" }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>{error}</Alert>}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
              <TextField
                label="ชื่อที่แสดง"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                fullWidth
                sx={inputStyle}
              />

              <TextField
                label="ช่องทางติดต่อ (เบอร์โทร, Line, FB)"
                placeholder="ระบุเบอร์โทรศัพท์ หรือ ID โซเชียล"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                fullWidth
                sx={inputStyle}
              />

              <Button 
                variant="contained" 
                onClick={handleUpdate}
                sx={{ 
                  py: 1.5, 
                  borderRadius: "999px", 
                  fontWeight: "bold", 
                  bgcolor: "#2563eb", 
                  fontSize: "1rem",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#1d4ed8" }
                }}
              >
                บันทึกข้อมูล
              </Button>

              <Button 
                variant="outlined" 
                color="warning" 
                onClick={() => navigate("/")} 
                sx={{ 
                  py: 1.2, 
                  borderRadius: "999px", 
                  fontWeight: "bold",
                  textTransform: "none",
                  mt: 1
                }}
              >
                กลับหน้าหลัก
              </Button>

              {/* 🔹 ปุ่มออกจากระบบ (เปิด Dialog แทนการออกทันที) */}
              <Button 
                variant="text" 
                color="error" 
                onClick={() => setOpenLogoutDialog(true)} 
                sx={{ fontWeight: "bold", mt: 1, textTransform: "none" }}
              >
                ออกจากระบบ
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* ================= LOGOUT CONFIRMATION DIALOG ================= */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: isDark ? "#1e293b" : "#fff",
            color: isDark ? "#fff" : "text.primary",
            borderRadius: 4,
            border: isDark ? "1px solid #334155" : "none",
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 800 }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 32 }} />
          ยืนยันการออกจากระบบ
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: isDark ? "#94a3b8" : "text.secondary", mt: 1 }}>
            คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชีผู้ใช้ของคุณ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenLogoutDialog(false)} 
            sx={{ 
              color: isDark ? "#94a3b8" : "text.secondary", 
              fontWeight: "bold",
              borderRadius: "999px",
              px: 3
            }}
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="contained" 
            color="error" 
            sx={{ 
              borderRadius: "999px", 
              fontWeight: "bold",
              px: 3,
              boxShadow: "none"
            }}
          >
            ออกจากระบบ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}