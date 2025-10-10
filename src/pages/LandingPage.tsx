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
import { motion } from "framer-motion";

import Navbar from "../components/Navbar";

export default function LandingPage() {
  const features = [
    // {
    //   title: "แนะนำระบบ",
    //   desc: "รู้จักระบบแจ้งเหตุชุมชน",
    //   href: "/about", 
    //   icon: <WarningIcon color="primary" />,
    // },
    {
      title: "ดูเหตุการณ์",
      desc: "ติดตามเหตุการณ์ในพื้นที่",
      href: "/events",
      icon: <VisibilityIcon color="primary" />,
    },
    {
      title: "เช็คประวัติเหตุการณ์",
      desc: "ดูประวัติการแจ้งเหตุย้อนหลัง",
      href: "/report",
      icon: <VisibilityIcon color="primary" />,
    },
    {
      title: "สมัครรับแจ้งเตือน",
      desc: "รับการแจ้งเตือนผ่านอีเมลหรือไลน์",
      href: "/subscribe",
      icon: <NotificationsIcon color="primary" />,
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
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
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              mb: 2,
              color: "#1e3a8a",
            }}
          >
            ระบบแจ้งเตือนเหตุการณ์เฉพาะพื้นที่
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 600, mb: 4 }}>
            ติดตามเหตุการณ์แบบเรียลไทม์ แจ้งเหตุได้ทันที พร้อมรับการแจ้งเตือนในพื้นที่ของคุณ
          </Typography>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/report"
              sx={{
                px: 6,
                py: 2,
                borderRadius: "2rem",
              }}
            >
              แจ้งเหตุทันที
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      {/* Features Section */}
      <Container sx={{ py: 10 }}>
        <Box
          sx={{
            display: "grid",
            justifyContent: "center", // ✅ จัดให้อยู่กลาง
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(auto-fill, minmax(280px, 1fr))", // ✅ ใช้ auto-fill เพื่อไม่ยืดเต็ม
              md: "repeat(auto-fill, minmax(300px, 1fr))",
            },
            gap: 4,
            maxWidth: "1100px", // ✅ จำกัดความกว้างรวมของกริด
            mx: "auto",
          }}
        >

          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 80 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="h6"
                    sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                  >
                    {f.icon} {f.title}
                  </Typography>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {f.desc}
                  </Typography>

                  <Button
                    component={Link}
                    to={f.href}
                    variant="outlined"
                    sx={{
                      mt: 2,
                      borderRadius: "999px",
                      textTransform: "none",
                      transition: "all 0.3s",
                      "&:hover": {
                        borderColor: "primary.main",
                        backgroundColor: "primary.light",
                        color: "primary.dark",
                      },
                    }}
                  >
                    ไปยังหน้า
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
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
