import React, { useState } from "react";
import {
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  // 👉 1. นำเข้าคอมโพเนนต์สำหรับทำปุ่มในช่องกรอกข้อความ
  InputAdornment, 
  IconButton 
} from "@mui/material";
// 👉 2. นำเข้า Icon รูปดวงตา
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 👉 3. เพิ่ม State สำหรับจดจำว่าตอนนี้เปิดหรือปิดรหัสผ่านอยู่
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
        navigate("/admin/dashboard");
      } else {
        await signOut(auth);
        setError("ไม่มีสิทธิ์เข้าถึง: บัญชีนี้ไม่ใช่ผู้ดูแลระบบ");
      }
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        setError("เกิดข้อผิดพลาดในการล็อกอิน");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับสลับการแสดงรหัสผ่าน
  const handleClickShowPassword = () => setShowPassword((show) => !show);

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
            // 👉 4. เปลี่ยน Type ตาม State
            type={showPassword ? "text" : "password"} 
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 2 }}
            required
            // 👉 5. ใส่ปุ่มดวงตาไว้ท้ายช่อง (endAdornment)
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {error && (
            <Typography color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
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
            disabled={loading}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}