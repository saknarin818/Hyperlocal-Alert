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
  
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      {/* HERO */}
      <Container
        maxWidth="lg"
        sx={{
          pt: { xs: 5, sm: 7, md: 10 },
          pb: { xs: 2, sm: 4, md: 6 },
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
                xs: "1.9rem",
                sm: "2.4rem",
                md: "3rem",
                lg: "3.4rem",
              },
              lineHeight: 1.2,
            }}
          >
            ระบบแจ้งเตือนเหตุการณ์เฉพาะพื้นที่
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 720,
              mx: "auto",
              mb: { xs: 3, md: 4 },
              fontSize: {
                xs: "0.95rem",
                sm: "1.05rem",
                md: "1.15rem",
              },
            }}
          >
            ติดตามเหตุการณ์แบบเรียลไทม์ แจ้งเหตุได้ทันที
            พร้อมรับการแจ้งเตือนในพื้นที่ของคุณ
          </Typography>

          <Button
            component={Link}
            to="/report"
            variant="contained"
            startIcon={<WarningIcon />}
            sx={{
              px: { xs: 4, md: 6 },
              py: { xs: 1.4, md: 1.8 },
              borderRadius: "999px",
              fontSize: { xs: 14, md: 16 },
              width: { xs: "100%", sm: "auto" }, // 📱 full width on mobile
              maxWidth: 320,
              boxShadow: `0 6px 18px ${alpha(
                theme.palette.primary.main,
                0.35
              )}`,
              "&:hover": {
                boxShadow: `0 8px 22px ${alpha(
                  theme.palette.primary.main,
                  0.45
                )}`,
              },
            }}
          >
            แจ้งเหตุทันที
          </Button>
        </motion.div>
      </Container>

      {/* FEED */}
      <Box sx={{ flexGrow: 1 }}>
        <LatestIncidents />
      </Box>

      {/* FOOTER */}
      <Box
        py={{ xs: 3, md: 4 }}
        textAlign="center"
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: "blur(6px)",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: 12, md: 13 } }}
        >
          © 2025 Hyperlocal Community Alert System 
        </Typography>
      </Box>
    </Box>
  );
}
