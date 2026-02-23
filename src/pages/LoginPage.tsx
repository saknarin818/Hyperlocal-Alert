import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Button,
  Typography,
  Alert,
  TextField,
  CircularProgress,
  Paper
} from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type LoginPageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function LoginPage({
  mode,
  toggleTheme
}: LoginPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState<
    "idle" | "pending" | "error"
  >("idle");

  const [message, setMessage] = useState<string | null>(null);

  // ✅ ถ้า login อยู่แล้ว redirect ทันที
  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!email || !password) {
      setMessage("กรุณากรอกอีเมลและรหัสผ่าน");
      return false;
    }
    return true;
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      setMessage(null);

      if (!validateForm()) return;

      setStatus("pending");

      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile", { replace: true });

    } catch (err: any) {
      setStatus("error");

      if (err.code === "auth/user-not-found") {
        setMessage("ไม่พบบัญชีผู้ใช้นี้");
      } else if (err.code === "auth/wrong-password") {
        setMessage("รหัสผ่านไม่ถูกต้อง");
      } else if (err.code === "auth/invalid-email") {
        setMessage("รูปแบบอีเมลไม่ถูกต้อง");
      } else {
        setMessage("เข้าสู่ระบบไม่สำเร็จ");
      }
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            เข้าสู่ระบบ
          </Typography>

          {message && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}

          {/* ✅ ใช้ form เพื่อรองรับ Enter */}
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              mt: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2
            }}
          >
            <TextField
              label="อีเมล"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="รหัสผ่าน"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={status === "pending"}
              sx={{ py: 1.2 }}
            >
              {status === "pending" ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>

            <Typography variant="body2" align="center">
              ยังไม่มีบัญชี?{" "}
              <Link to="/register" style={{ textDecoration: "none" }}>
                สมัครสมาชิก
              </Link>
            </Typography>

            <Typography variant="body2" align="center">
              <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                ลืมรหัสผ่าน?
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}