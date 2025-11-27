import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

// สร้าง Type สำหรับข้อมูลเหตุการณ์
interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  status: "กำลังตรวจสอบ" | "เสร็จสิ้น";
  createdAt: Timestamp;
}

const getStatusColor = (status: string) => {
  return status === "กำลังตรวจสอบ" ? "warning" : "success";
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลเหตุการณ์จาก Firestore
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const incidentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Incident[];
        setIncidents(incidentsData);
      } catch (error) {
        console.error("Error fetching incidents: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold">
              Admin Dashboard
            </Typography>
            <Button variant="contained" color="error" onClick={handleLogout}>
              ออกจากระบบ
            </Button>
          </Box>

          <Typography variant="h6" gutterBottom>
            รายการเหตุการณ์ล่าสุด
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>ประเภท</TableCell>
                    <TableCell>รายละเอียด</TableCell>
                    <TableCell>สถานที่</TableCell>
                    <TableCell align="center">สถานะ</TableCell>
                    <TableCell>เวลาที่แจ้ง</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incidents.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.type}
                      </TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.status}
                          color={getStatusColor(row.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {row.createdAt.toDate().toLocaleString("th-TH")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
