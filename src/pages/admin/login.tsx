import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
// เปลี่ยนจาก next/router เป็น react-router-dom
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  // เปลี่ยน useRouter เป็น useNavigate
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // ยังไม่เชื่อม Database — Mock login ก่อน
    if (email === "admin@alert.com" && password === "123456") {
      // เปลี่ยน router.push เป็น navigate
      navigate("/admin/dashboard"); // ไปหน้า dashboard
    } else {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          width: "100%",
          textAlign: "center",
          background: "linear-gradient(to right, #f0f9ff, #e0f2fe)",
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
          Admin Login
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 3,
              py: 1.2,
              borderRadius: "999px",
              fontWeight: "bold",
            }}
          >
            เข้าสู่ระบบ
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
