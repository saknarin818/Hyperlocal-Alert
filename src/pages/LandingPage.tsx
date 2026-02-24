import React from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Button,
  Container,
  Box,
  useTheme,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { alpha } from "@mui/material/styles";
import "leaflet/dist/leaflet.css";
import LatestIncidents from "../components/LatestIncidents";

/* props จาก App */
type LandingPageProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function LandingPage({ mode, toggleTheme }: LandingPageProps) {
  const theme = useTheme();
  const isDark = mode === "dark";

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column",
        // 🔹 ปรับพื้นหลังตามธีมให้เข้ากับหน้า Login/Register/Profile
        bgcolor: isDark ? "#0f172a" : "#f8fafc",
        color: isDark ? "#fff" : "text.primary",
        transition: "0.3s"
      }}
    >
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      {/* HERO SECTION */}
      <Container
        maxWidth="lg"
        sx={{
          pt: { xs: 8, sm: 10, md: 12 },
          pb: { xs: 4, sm: 6, md: 8 },
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Typography
            fontWeight={800}
            gutterBottom
            sx={{
              fontSize: {
                xs: "2.2rem",
                sm: "3rem",
                md: "3.8rem",
                lg: "4.2rem",
              },
              lineHeight: 1.1,
              // 🔹 ปรับสีหัวข้อให้เด่นในโหมดมืด
              color: isDark ? "#38bdf8" : theme.palette.primary.main,
              mb: 2
            }}
          >
            ระบบแจ้งเตือนเหตุการณ์<br />เฉพาะพื้นที่
          </Typography>

          <Typography
            sx={{
              maxWidth: 720,
              mx: "auto",
              mb: { xs: 4, md: 6 },
              fontSize: {
                xs: "1rem",
                sm: "1.1rem",
                md: "1.25rem",
              },
              // 🔹 ปรับสีข้อความรอง
              color: isDark ? "#94a3b8" : "text.secondary",
            }}
          >
            ติดตามเหตุการณ์แบบเรียลไทม์ แจ้งเหตุได้ทันที <br />
            พร้อมรับการแจ้งเตือนในพื้นที่ของคุณ เพื่อความปลอดภัยของคนในชุมชน
          </Typography>

          <Button
            component={Link}
            to="/report"
            variant="contained"
            startIcon={<WarningIcon />}
            sx={{
              px: { xs: 5, md: 8 },
              py: { xs: 1.8, md: 2.2 },
              borderRadius: "999px",
              fontSize: { xs: 16, md: 18 },
              fontWeight: "bold",
              width: { xs: "100%", sm: "auto" },
              maxWidth: 320,
              textTransform: "none",
              bgcolor: "#2563eb",
              boxShadow: `0 10px 25px ${alpha(
                isDark ? "#2563eb" : theme.palette.primary.main,
                0.4
              )}`,
              "&:hover": {
                bgcolor: "#1d4ed8",
                boxShadow: `0 12px 30px ${alpha(
                  isDark ? "#2563eb" : theme.palette.primary.main,
                  0.5
                )}`,
              },
            }}
          >
            แจ้งเหตุทันที
          </Button>
        </motion.div>
      </Container>

      {/* FEED / INCIDENTS */}
      <Box sx={{ flexGrow: 1, pb: 8 }}>
        <Container maxWidth="lg">
           <LatestIncidents />
        </Container>
      </Box>

      {/* FOOTER */}
      <Box
        py={{ xs: 4, md: 5 }}
        textAlign="center"
        sx={{
          bgcolor: isDark ? "#1e293b" : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        }}
      >
        <Typography
          variant="body2"
          sx={{ 
            color: isDark ? "#94a3b8" : "text.secondary",
            fontSize: { xs: 13, md: 14 },
            fontWeight: 500
          }}
        >
          © 2026 Hyperlocal Community Alert System • พัฒนาเพื่อชุมชน
        </Typography>
      </Box>
    </Box>
  );
}