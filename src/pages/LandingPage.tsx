import React from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Box,
  AppBar,
  Toolbar,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningIcon from "@mui/icons-material/Warning";
import { motion } from "framer-motion";

export default function LandingPage() {
  const features = [
    {
      title: "ดูเหตุการณ์",
      desc: "ติดตามเหตุการณ์ในพื้นที่",
      href: "/events",
      icon: <VisibilityIcon color="primary" />,
    },
    {
      title: "เช็คประวัติเหตุการณ์",
      desc: "ดูประวัติการแจ้งเหตุย้อนหลัง",
      href: "/history",
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
        backgroundImage: `url("/images/background.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* 🔹 Overlay โปร่ง */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(255,255,255,0.15)",
          zIndex: 0,
        }}
      />

      {/* 🔹 Navbar เฉพาะหน้านี้ */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
          color: "#1e3a8a",
          zIndex: 10,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#1e3a8a",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Community Alert
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button color="inherit" component={Link} to="/">
              หน้าแรก
            </Button>
            <Button color="inherit" component={Link} to="/report">
              แจ้งเหตุ
            </Button>
            <Button color="inherit" component={Link} to="/events">
              ดูเหตุการณ์
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✅ Main Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          pt: 10, // เว้นพื้นที่ Navbar
        }}
      >
        {/* 🔹 Hero Section (ข้อความเด่น) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              py: 12,
              px: 2,
              position: "relative",
            }}
          >
            {/* พื้นหลังเบลอหลังข้อความ */}
            <Box
              sx={{
                position: "absolute",
                width: "90%",
                maxWidth: 800,
                height: "auto",
                background:
                  "linear-gradient(to bottom right, rgba(255,255,255,0.6), rgba(255,255,255,0.3))",
                borderRadius: 3,
                filter: "blur(8px)",
                zIndex: 0,
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ position: "relative", zIndex: 1 }}
            >
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  textShadow: "2px 2px 8px rgba(255,255,255,0.8)",
                  mb: 3,
                  letterSpacing: "0.02em",
                }}
              >
                ระบบแจ้งเตือนเหตุการณ์เฉพาะพื้นที่
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  maxWidth: 700,
                  mx: "auto",
                  color: "#1e293b",
                  textShadow: "1px 1px 6px rgba(255,255,255,0.9)",
                  lineHeight: 1.6,
                  fontWeight: 500,
                  mb: 5,
                }}
              >
                ติดตามเหตุการณ์แบบเรียลไทม์ แจ้งเหตุได้ทันที พร้อมรับการแจ้งเตือนในพื้นที่ของคุณ
              </Typography>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/report"
                  startIcon={<WarningIcon />}
                  sx={{
                    px: 6,
                    py: 2,
                    borderRadius: "2rem",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  แจ้งเหตุทันที
                </Button>
              </motion.div>
            </motion.div>
          </Box>
        </motion.div>

        {/* 🔹 Features Section */}
        <Container sx={{ py: 10 }}>
          <Box
            sx={{
              display: "grid",
              justifyContent: "center",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(auto-fill, minmax(280px, 1fr))",
                md: "repeat(auto-fill, minmax(300px, 1fr))",
              },
              gap: 4,
              maxWidth: "1100px",
              mx: "auto",
            }}
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 80,
                }}
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
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  <CardContent
                    sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
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

        {/* ✅ Footer อยู่ล่างเสมอ */}
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            bgcolor: "rgba(255,255,255,0.7)",
            mt: "auto",
          }}
        >
          <Typography variant="body2" color="textSecondary">
            © 2025 Hyperlocal Community Alert System
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
