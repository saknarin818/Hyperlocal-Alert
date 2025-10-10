import React from "react";
import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ในแอปจริง ส่วนนี้จะใช้ล้างข้อมูล token หรือ session
    navigate("/admin/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      {/* สามารถเพิ่ม Sidebar ได้ในภายหลัง */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" paragraph>
            ยินดีต้อนรับสู่หน้าจัดการระบบ ที่นี่คุณสามารถจัดการเหตุการณ์และผู้ใช้งานได้
          </Typography>
          <Button variant="contained" color="error" onClick={handleLogout}>
            ออกจากระบบ
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
