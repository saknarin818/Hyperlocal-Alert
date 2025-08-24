import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "../components/Navbar";

export default function LandingPage() {
  const [openAbout, setOpenAbout] = useState(false);

  const features = [
    {
      title: "แนะนำระบบ",
      desc: "รู้จักระบบแจ้งเหตุชุมชน",
      action: () => setOpenAbout(true),
      icon: <WarningIcon color="primary" />,
    },
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
            background: "linear-gradient(to right, #ebf8ff, #dbeafe)", // ✅ กลับมาใช้สีเดิม
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
              color: "#1e3a8a", // ✅ ใช้สีน้ำเงินเข้มแทน gradient
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

      <Container sx={{ py: 10 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 4,
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
                    boxShadow: 6, // เงาเพิ่มขึ้นเวลา hover
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

                  {f.href ? (
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
                  ) : (
                    <Button
                      onClick={f.action}
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
                      ดูรายละเอียด
                    </Button>
                  )}
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

      {/* Modal About */}
      <AnimatePresence>
        {openAbout && (
          <Dialog
            open={openAbout}
            onClose={() => setOpenAbout(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { overflow: "hidden", borderRadius: 4 } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
            >
              <DialogTitle>
                เกี่ยวกับระบบ
                <IconButton
                  aria-label="close"
                  onClick={() => setOpenAbout(false)}
                  sx={{ position: "absolute", right: 8, top: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <Typography gutterBottom>
                  ระบบแจ้งเหตุชุมชน (Community Alert System) ถูกออกแบบมาเพื่อช่วยให้ประชาชน
                  สามารถรายงานเหตุการณ์ต่าง ๆ ได้อย่างสะดวกและรวดเร็ว
                </Typography>
                <Typography gutterBottom>
                  ระบบนี้ยังช่วยให้ทุกคนสามารถติดตามสถานการณ์ล่าสุดในชุมชน
                  และรับการแจ้งเตือนผ่านช่องทางที่สะดวก เช่น อีเมล หรือไลน์
                  เพื่อเพิ่มความปลอดภัยและความอุ่นใจในชีวิตประจำวัน
                </Typography>
              </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </Box>
  );
}
