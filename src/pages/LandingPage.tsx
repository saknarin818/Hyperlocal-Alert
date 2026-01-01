import React, { useEffect, useState } from "react";
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
    <Box sx={{ minHeight: "100vh" }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      {/* HERO */}
      <Container sx={{ py: { xs: 8, md: 9 }, textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h2" fontWeight={800} gutterBottom>
            ระบบแจ้งเตือนเหตุการณ์เฉพาะพื้นที่
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto", mb: 4 }}
          >
            ติดตามเหตุการณ์แบบเรียลไทม์ แจ้งเหตุได้ทันที
            พร้อมรับการแจ้งเตือนในพื้นที่ของคุณ
          </Typography>

          <Button
            component={Link}
            to="/report"
            variant="contained"
            size="large"
            startIcon={<WarningIcon />}
            sx={{ px: 6, py: 2, borderRadius: "999px" }}
          >
            แจ้งเหตุทันที
          </Button>
        </motion.div>
      </Container>

      {/* FEED */}
      <LatestIncidents />

      {/* FOOTER */}
      <Box
        py={4}
        textAlign="center"
        bgcolor={alpha(theme.palette.background.paper, 0.8)}
      >
        <Typography variant="body2" color="text.secondary">
          © 2025 Hyperlocal Community Alert System
        </Typography>
      </Box>
    </Box>
  );
}
