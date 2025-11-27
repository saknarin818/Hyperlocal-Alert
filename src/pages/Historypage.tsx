import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ลงทะเบียน components ที่จำเป็นสำหรับ Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ใช้ข้อมูลตัวอย่างชุดเดียวกับหน้า EventsPage
const mockIncidents = [
  { type: "ไฟไหม้" },
  { type: "อุบัติเหตุ" },
  { type: "อาชญากรรม" },
  { type: "ไฟไหม้" },
  { type: "อื่น ๆ" },
  { type: "อุบัติเหตุ" },
  { type: "ไฟไหม้" },
];

// ประมวลผลข้อมูลเพื่อสร้างกราฟ
const processDataForChart = () => {
  const counts: { [key: string]: number } = {};
  mockIncidents.forEach((incident) => {
    counts[incident.type] = (counts[incident.type] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const data = Object.values(counts);

  return {
    labels,
    datasets: [
      {
        label: "จำนวนเหตุการณ์",
        data,
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
};

export default function HistoryPage() {
  const chartData = processDataForChart();

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "สรุปจำนวนเหตุการณ์ตามประเภท",
        font: {
          size: 18,
        },
      },
    },
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#1e3a8a", mb: 4 }}
          >
            ประวัติและสถิติเหตุการณ์
          </Typography>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Bar options={options} data={chartData} />
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}