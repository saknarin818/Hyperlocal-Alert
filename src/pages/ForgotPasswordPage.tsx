// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Box,
  IconButton,
} from "@mui/material";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type Props = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

const ForgotPasswordPage = ({ mode, toggleTheme }: Props) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDark = mode === "dark";

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว กรุณาเช็คใน Inbox หรือ Junk mail");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("ไม่พบอีเมลนี้ในระบบ");
      } else {
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 สไตล์สำหรับช่องกรอกข้อมูล (Dark Mode Style)
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      color: isDark ? "#fff" : "inherit",
      borderRadius: "8px",
      "& fieldset": { borderColor: isDark ? "#334155" : "rgba(0,0,0,0.23)" },
      "&:hover fieldset": { borderColor: "#38bdf8" },
      "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
    },
    "& .MuiInputLabel-root": { color: isDark ? "#94a3b8" : "text.secondary" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#38bdf8" },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: isDark ? "#0f172a" : "#f8fafc",
        transition: "0.3s",
      }}
    >
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="sm" sx={{ pt: { xs: 8, md: 12 } }}>
        <Paper
          elevation={isDark ? 0 : 3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            bgcolor: isDark ? "#1e293b" : "#fff",
            color: isDark ? "#fff" : "text.primary",
            border: isDark ? "1px solid #334155" : "none",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ color: isDark ? "#38bdf8" : "primary.main" }}
          >
            ลืมรหัสผ่านใช่ไหม?
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "text.secondary", mb: 4 }}>
            กรอกอีเมลที่คุณใช้สมัครสมาชิก เพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
          </Typography>

          {message && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleReset}>
            <Stack spacing={3}>
              <TextField
                label="อีเมลของคุณ"
                type="email"
                required
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={inputStyle}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: "999px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                  textTransform: "none",
                }}
              >
                {loading ? "กำลังส่งข้อมูล..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
              </Button>

              <Button
                component={Link}
                to="/login"
                startIcon={<ArrowBackIcon />}
                sx={{
                  color: isDark ? "#94a3b8" : "text.secondary",
                  textTransform: "none",
                  fontWeight: "bold",
                  "&:hover": { color: "#38bdf8" },
                }}
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;