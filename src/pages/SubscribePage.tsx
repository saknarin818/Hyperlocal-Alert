import React, { useState, useEffect } from "react";
import { Container, Box, Button, Typography, Alert } from "@mui/material";
import Navbar from "../components/Navbar"; // Assuming Navbar is imported correctly
import { registerForPush, unregisterToken } from "../pushNotifications"; // Make sure path is correct

// Define props for SubscribePage to match App.tsx if needed
type SubscribePageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function SubscribePage({ mode, toggleTheme }: SubscribePageProps) {
  const [status, setStatus] = useState<"idle" | "pending" | "subscribed" | "error">("idle");
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Check initial subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        // You might want to retrieve the stored token from localStorage
        // or re-generate it to confirm. For simplicity, we assume if granted, it's subscribed.
        setStatus("subscribed");
        setMessage("คุณได้รับการสมัครรับแจ้งเตือนแล้ว");
      }
    };
    checkSubscription();
  }, []);

  const handleSubscribe = async () => {
    try {
      setStatus("pending");
      setMessage(null);
      const token = await registerForPush();
      if (token) {
        setCurrentToken(token);
        setStatus("subscribed");
        setMessage("สมัครรับแจ้งเตือนสำเร็จแล้ว!");
      } else {
        setStatus("error");
        setMessage("ไม่สามารถสมัครรับแจ้งเตือนได้ กรุณาตรวจสอบสิทธิ์การแจ้งเตือนของเบราว์เซอร์");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(`เกิดข้อผิดพลาด: ${err.message || 'ไม่ทราบสาเหตุ'}`);
    }
  };

  const handleUnsubscribe = async () => {
    if (!currentToken) {
      setMessage("ไม่พบ Token ที่จะยกเลิก");
      return;
    }
    try {
      await unregisterToken(currentToken);
      setCurrentToken(null);
      setStatus("idle");
      setMessage("ยกเลิกการสมัครรับแจ้งเตือนสำเร็จแล้ว!");
      // Optionally request notification permission to be denied
      if ('Notification' in window) {
        Notification.requestPermission(permission => {
          if (permission === 'granted') {
            // If granted after unsubscription, this is unexpected for a full revoke
            // Users would manually need to deny it in browser settings
          }
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(`เกิดข้อผิดพลาดในการยกเลิก: ${err.message || 'ไม่ทราบสาเหตุ'}`);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom>สมัครรับการแจ้งเตือน</Typography>
        <Typography variant="body2" gutterBottom>
          เมื่อกดปุ่มด้านล่าง ระบบจะขออนุญาตแสดงการแจ้งเตือน โปรดกด "อนุญาต" เมื่อเบราว์เซอร์ขอ
        </Typography>

        {message && (
          <Alert severity={status === "error" ? "error" : "info"} sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          {status !== "subscribed" ? (
            <Button variant="contained" fullWidth onClick={handleSubscribe} disabled={status === "pending"}>
              {status === "pending" ? "กำลังสมัคร..." : "รับการแจ้งเตือน"}
            </Button>
          ) : (
            <Button variant="outlined" fullWidth color="error" onClick={handleUnsubscribe}>
              ยกเลิกการรับการแจ้งเตือน
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}