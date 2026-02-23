import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Button,
  Typography,
  Alert,
  TextField,
  CircularProgress
} from "@mui/material";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  // 🔹 ถ้า login อยู่แล้ว redirect
  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
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

      // 1️⃣ สร้างบัญชีใน Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const newUser = userCredential.user;

      // 2️⃣ สร้าง document ใน Firestore
      await setDoc(doc(db, "users", newUser.uid), {
        email: newUser.email,
        role: "user",
        displayName: "",
        phone: "",
        fcmTokens: [],
        createdAt: serverTimestamp()
      });

      setStatus("success");
      setMessage("สมัครสมาชิกสำเร็จ 🎉");

      // 3️⃣ Redirect
      setTimeout(() => {
        navigate("/profile");
      }, 1200);

    } catch (err: any) {
      setStatus("error");

      if (err.code === "auth/email-already-in-use") {
        setMessage("อีเมลนี้ถูกใช้งานแล้ว");
      } else if (err.code === "auth/invalid-email") {
        setMessage("รูปแบบอีเมลไม่ถูกต้อง");
      } else {
        setMessage("เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          สมัครสมาชิก
        </Typography>

        {message && (
          <Alert
            severity={status === "success" ? "success" : "error"}
            sx={{ mt: 2 }}
          >
            {message}
          </Alert>
        )}

        <Box
          sx={{
            mt: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2
          }}
        >
          <TextField
            label="อีเมล"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="รหัสผ่าน"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TextField
            label="ยืนยันรหัสผ่าน"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleRegister}
            disabled={status === "pending"}
            sx={{ py: 1.2 }}
          >
            {status === "pending" ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "สมัครสมาชิก"
            )}
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            มีบัญชีแล้ว?{" "}
            <Link to="/login" style={{ textDecoration: "none" }}>
              เข้าสู่ระบบ
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}