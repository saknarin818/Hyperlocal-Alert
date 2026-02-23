// src/pages/ProfilePage.tsx

import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip
} from "@mui/material";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import {
  registerForPush,
  unregisterToken
} from "../pushNotifications";

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
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔹 โหลดข้อมูลจาก Firestore
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
          setPhone(data.phone || "");
        }

      } catch {
        setError("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleUpdate = async () => {
    if (!user) return;

    if (phone && !/^[0-9]{9,10}$/.test(phone)) {
      setError("รูปแบบเบอร์โทรไม่ถูกต้อง");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        phone
      });

      setMessage("บันทึกข้อมูลสำเร็จแล้ว ✅");
      setError(null);
    } catch {
      setError("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleEnableNotification = async () => {
    try {
      await registerForPush();
      setMessage("เปิดรับการแจ้งเตือนสำเร็จ 🔔");
    } catch {
      setError("เปิดการแจ้งเตือนไม่สำเร็จ");
    }
  };

  const handleDisableNotification = async () => {
    try {
      const token = await registerForPush();
      if (token) {
        await unregisterToken(token);
      }
      setMessage("ยกเลิกการแจ้งเตือนแล้ว");
    } catch {
      setError("ยกเลิกไม่สำเร็จ");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          โปรไฟล์ผู้ใช้
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {user && (
          <>
            <Typography>อีเมล: {user.email}</Typography>
            <Typography>UID: {user.uid}</Typography>

            <Box sx={{ mt: 1 }}>
              <Chip
                label={`สิทธิ์: ${role}`}
                color={role === "admin" ? "error" : "primary"}
              />
            </Box>

            <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="ชื่อที่แสดง"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                fullWidth
              />

              <TextField
                label="เบอร์โทร"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
              />

              <Button
                variant="contained"
                onClick={handleUpdate}
              >
                บันทึกข้อมูล
              </Button>

              <Button
                variant="outlined"
                onClick={handleEnableNotification}
              >
                เปิดรับการแจ้งเตือน 🔔
              </Button>

              <Button
                variant="outlined"
                color="warning"
                onClick={handleDisableNotification}
              >
                ยกเลิกการแจ้งเตือน
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
              >
                ออกจากระบบ
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}