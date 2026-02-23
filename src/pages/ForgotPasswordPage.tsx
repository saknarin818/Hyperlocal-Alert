import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว");
    } catch (err: any) {
      setError("ไม่พบอีเมลนี้ในระบบ หรือเกิดข้อผิดพลาด");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={2} fontWeight="bold">
          ลืมรหัสผ่าน
        </Typography>

        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <form onSubmit={handleReset}>
          <Stack spacing={2} mt={2}>
            <TextField
              label="กรอกอีเมลของคุณ"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" variant="contained" size="large">
              ส่งลิงก์รีเซ็ตรหัสผ่าน
            </Button>

            <Button component={Link} to="/login">
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;