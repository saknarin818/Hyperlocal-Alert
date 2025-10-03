import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  MenuItem,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

const incidentTypes = [
  { value: "fire", label: "ไฟไหม้" },
  { value: "accident", label: "อุบัติเหตุ" },
  { value: "crime", label: "อาชญากรรม" },
  { value: "other", label: "อื่น ๆ" },
];

export default function ReportIncidentPage() {
  const [form, setForm] = useState({
    type: "",
    description: "",
    location: "",
    contact: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("ส่งข้อมูลเรียบร้อยแล้ว!");
    setForm({ type: "", description: "", location: "", contact: "" });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Hero Section */}
      {/* <motion.div
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
            py: 8,
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
            แจ้งเหตุการณ์
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 600, mb: 4 }}>
            โปรดกรอกรายละเอียดเหตุการณ์ที่ต้องการแจ้ง ระบบจะส่งข้อมูลไปยังผู้เกี่ยวข้องในพื้นที่ของคุณ
          </Typography>
        </Box>
      </motion.div> */}

      {/* Form Section */}
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                select
                label="ประเภทเหตุการณ์"
                name="type"
                value={form.type}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              >
                {incidentTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="รายละเอียดเหตุการณ์"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={3}
                margin="normal"
              />
              <TextField
                label="สถานที่เกิดเหตุ"
                name="location"
                value={form.location}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="ข้อมูลติดต่อ (ถ้ามี)"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3, borderRadius: "2rem" }}
              >
                ส่งข้อมูล
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ mt: 2, borderRadius: "2rem" }}
                onClick={() => setForm({ type: "", description: "", location: "", contact: "" })}
              >
                ล้างข้อมูล
              </Button>
              <Button
                type="button"
                variant="text"
                color="primary"
                fullWidth
                sx={{ mt: 3, borderRadius: "2rem" }}
                onClick={() => window.location.href = "/"}
              >
                กลับหน้าหลัก
              </Button>
            </Box>
          </Paper>
        </motion.div>
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