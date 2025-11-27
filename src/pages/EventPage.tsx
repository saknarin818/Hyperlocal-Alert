import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Navbar from "../components/Navbar";

export default function EventPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลจาก Firestore
  useEffect(() => {
    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          py: 6,
          backgroundColor: "#f4f6f8",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            เหตุการณ์ในพื้นที่
          </Typography>

          {events.length === 0 && (
            <Typography textAlign="center" mt={5}>
              ยังไม่มีรายงานเหตุการณ์
            </Typography>
          )}

          {events.map((ev, index) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  mt: 3,
                  borderRadius: 3,
                  background: "white",
                }}
              >
                {/* ประเภทเหตุการณ์ */}
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {ev.type}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* รายละเอียด */}
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {ev.description}
                </Typography>

                {/* สถานที่ */}
                <Typography variant="body2" color="text.secondary">
                  📍 {ev.location}
                </Typography>

<<<<<<< HEAD
              {/* ข้อมูลติดต่อ */}
              <Typography variant="body2" color="text.secondary">
                📞 ติดต่อเพื่อสอบถามข้อมูลเท่านั้น!!! : {ev.contact || "-"}
              </Typography>
=======
                {/* ข้อมูลติดต่อ */}
                <Typography variant="body2" color="text.secondary">
                  📞 ติดต่อเพื่อสอบถามข้อมูลเท่านั้น! : {ev.contact || "-"}
                </Typography>
>>>>>>> upstream/develop

                {/* เวลา */}
                <Typography variant="caption" color="text.secondary">
                  🕒{" "}
                  {ev.createdAt?.toDate
                    ? ev.createdAt.toDate().toLocaleString("th-TH")
                    : "-"}
                </Typography>
              </Paper>
            </motion.div>
          ))}
        </Container>
      </Box>
    </>
  );
}
