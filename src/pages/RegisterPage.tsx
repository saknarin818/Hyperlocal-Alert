import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Button,
  Typography,
  Alert,
  TextField,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type RegisterPageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function RegisterPage({
  mode,
  toggleTheme
}: RegisterPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  // 🔹 เช็คสถานะธีม
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
    mb: 2
  };

  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!displayName || !email || !password || !confirmPassword) {
      setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return false;
    }
    if (password.length < 6) {
      setMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }
    if (password !== confirmPassword) {
      setMessage("รหัสผ่านไม่ตรงกัน");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    try {
      setMessage(null);
      if (!validateForm()) return;
      setStatus("pending");

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await setDoc(doc(db, "users", newUser.uid), {
        email: newUser.email,
        displayName: displayName,
        role: "user",
        contact: "", // 🔹 เปลี่ยนเป็น contact ตามหน้า Profile
        photoURL: "",
        fcmTokens: [],
        createdAt: serverTimestamp(),
        lastOnline: serverTimestamp()
      });

      setStatus("success");
      setMessage("สมัครสมาชิกสำเร็จ 🎉");

      setTimeout(() => {
        navigate("/profile");
      }, 1200);

    } catch (err: any) {
      setStatus("error");
      if (err.code === "auth/email-already-in-use") {
        setMessage("อีเมลนี้ถูกใช้งานแล้ว");
      } else {
        setMessage("เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    }
  };

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh", 
      bgcolor: isDark ? "#0f172a" : "#f8fafc",
      transition: "0.3s"
    }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="sm" sx={{ display: "flex", alignItems: "center", flexGrow: 1, py: 4 }}>
        <Paper 
          elevation={isDark ? 0 : 3} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 4, 
            width: "100%", 
            textAlign: "center",
            bgcolor: isDark ? "#1e293b" : "#fff", 
            color: isDark ? "#fff" : "text.primary",
            border: isDark ? "1px solid #334155" : "none",
            transition: "0.3s"
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: isDark ? "#38bdf8" : "#1976d2" }}>
            สมัครสมาชิก
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "text.secondary", mb: 4 }}>
            สร้างบัญชีใหม่เพื่อร่วมเป็นส่วนหนึ่งในชุมชนของเรา
          </Typography>

          {message && (
            <Alert severity={status === "success" ? "success" : "error"} sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <TextField
              label="ชื่อ-นามสกุล *"
              variant="outlined"
              fullWidth
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              sx={inputStyle}
            />

            <TextField
              label="อีเมล (Email) *"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={inputStyle}
            />

            <TextField
              label="รหัสผ่าน (Password) *"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={inputStyle}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)} 
                      edge="end" 
                      sx={{ color: isDark ? "#94a3b8" : "inherit" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="ยืนยันรหัสผ่าน (Confirm Password) *"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={inputStyle}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      edge="end" 
                      sx={{ color: isDark ? "#94a3b8" : "inherit" }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handleRegister}
              disabled={status === "pending"}
              sx={{ 
                py: 1.5, 
                borderRadius: "999px", 
                fontWeight: "bold",
                fontSize: "1.1rem",
                mt: 1,
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" }
              }}
            >
              {status === "pending" ? <CircularProgress size={24} color="inherit" /> : "สมัครสมาชิก"}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 3, color: isDark ? "#94a3b8" : "text.secondary" }}>
              มีบัญชีอยู่แล้วใช่ไหม?{" "}
              <Link to="/login" style={{ textDecoration: "none", fontWeight: "bold", color: isDark ? "#38bdf8" : "#1976d2" }}>
                เข้าสู่ระบบ
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}