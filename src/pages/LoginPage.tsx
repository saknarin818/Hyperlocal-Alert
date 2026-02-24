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

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type LoginPageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function LoginPage({ mode, toggleTheme }: LoginPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  // 🔹 ตรวจสอบว่าเป็น Dark Mode หรือไม่
  const isDark = mode === "dark";

  // 🔹 สไตล์สำหรับช่องกรอกข้อมูลที่เปลี่ยนตามธีม
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      // เปลี่ยนสีตัวอักษรตามธีม
      color: isDark ? "#fff" : "inherit",
      borderRadius: "8px",
      "& fieldset": { 
        borderColor: isDark ? "#334155" : "rgba(0, 0, 0, 0.23)" 
      },
      "&:hover fieldset": { 
        borderColor: "#38bdf8" 
      },
      "&.Mui-focused fieldset": { 
        borderColor: "#38bdf8" 
      },
    },
    // สีของ Label เปลี่ยนตามธีม
    "& .MuiInputLabel-root": { 
      color: isDark ? "#94a3b8" : "text.secondary" 
    },
    "& .MuiInputLabel-root.Mui-focused": { 
      color: "#38bdf8" 
    },
    mb: 2.5
  };

  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setMessage("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    try {
      setMessage(null);
      setStatus("pending");
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile", { replace: true });
    } catch (err: any) {
      setStatus("error");
      if (err.code === "auth/invalid-credential") {
        setMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        setMessage("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
      }
    }
  };

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        // 🔹 เปลี่ยนพื้นหลังตามธีม
        bgcolor: isDark ? "#0f172a" : "#f8fafc",
        transition: "0.3s" 
      }}
    >
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="sm" sx={{ display: "flex", alignItems: "center", flexGrow: 1, py: 4 }}>
        <Paper 
          elevation={isDark ? 0 : 3} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 4, 
            width: "100%", 
            textAlign: "center",
            // 🔹 เปลี่ยนสีพื้นหลังกระดาษตามธีม
            bgcolor: isDark ? "#1e293b" : "#fff", 
            color: isDark ? "#fff" : "text.primary",
            border: isDark ? "1px solid #334155" : "none",
            transition: "0.3s"
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: "#38bdf8", mb: 1 }}>
            เข้าสู่ระบบ
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "text.secondary", mb: 4 }}>
            ยินดีต้อนรับกลับมา! กรุณาเข้าสู่ระบบเพื่อใช้งานระบบ
          </Typography>

          {message && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column" }}>
            <TextField
              label="อีเมล (Email) *"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={inputStyle}
            />

            <TextField
              label="รหัสผ่าน (Password) *"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
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

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={status === "pending"}
              sx={{ 
                py: 1.5, 
                borderRadius: "999px", 
                fontWeight: "bold",
                fontSize: "1.1rem",
                mt: 1,
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
                textTransform: "none"
              }}
            >
              {status === "pending" ? <CircularProgress size={24} color="inherit" /> : "เข้าสู่ระบบ"}
            </Button>

            <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "text.secondary" }}>
                ยังไม่มีบัญชีใช่ไหม?{" "}
                <Link to="/register" style={{ textDecoration: "none", fontWeight: "bold", color: "#38bdf8" }}>
                  สมัครสมาชิก
                </Link>
              </Typography>

              <Link to="/forgot-password" style={{ textDecoration: "none", color: isDark ? "#64748b" : "text.secondary", fontSize: "0.875rem" }}>
                ลืมรหัสผ่าน?
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}