import React from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NotificationsIcon from "@mui/icons-material/Notifications";

import Navbar from "../components/Navbar"; // ✅ import navbar

export default function LandingPage() {
  const features = [
    { title: "แนะนำระบบ", desc: "รู้จักระบบแจ้งเหตุชุมชน", href: "/about", icon: <WarningIcon color="primary" /> },
    { title: "แจ้งเหตุ", desc: "รายงานเหตุการณ์ได้ทันที", href: "/report", icon: <WarningIcon color="primary" /> },
    { title: "ดูเหตุการณ์", desc: "ติดตามเหตุการณ์ในพื้นที่", href: "/events", icon: <VisibilityIcon color="primary" /> },
    { title: "สมัครรับแจ้งเตือน", desc: "รับการแจ้งเตือนผ่านอีเมลหรือไลน์", href: "/subscribe", icon: <NotificationsIcon color="primary" /> },
  ];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ✅ Navbar ที่แยกเป็น component */}
      <Navbar />

      {/* Hero */}
      <Box
        sx={{
          flex: 1,
          background: "linear-gradient(to right, #ebf8ff, #dbeafe)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: 10,
          px: 2,
        }}
      >
        <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
          ระบบแจ้งเตือนเหตุการณ์เฉพาะพื้นที่
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mb: 4 }}>
          ติดตามเหตุการณ์แบบเรียลไทม์ แจ้งเหตุได้ทันที พร้อมรับการแจ้งเตือนในพื้นที่ของคุณ
        </Typography>
        <Button variant="contained" color="primary" component={Link} to="/report" sx={{ px: 6, py: 2 }}>
          แจ้งเหตุทันที
        </Button>
      </Box>

      {/* Features */}
      <Container sx={{ py: 10 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 4,
          }}
        >
          {features.map((f) => (
            <Card key={f.href} sx={{ minWidth: 0, display: "flex", flexDirection: "column", height: "100%" }}>
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  {f.icon} {f.title}
                </Typography>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {f.desc}
                </Typography>
                <Button component={Link} to={f.href} variant="outlined" sx={{ mt: 2 }}>
                  ไปยังหน้า
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 4, textAlign: "center", bgcolor: "#f3f4f6", mt: "auto" }}>
        <Typography variant="body2" color="textSecondary">
          © 2025 Hyperlocal Community Alert System
        </Typography>
      </Box>
    </Box>
  );
}
