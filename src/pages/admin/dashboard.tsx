import React, { useEffect, useState } from "react";
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
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

import Navbar from "../../components/Navbar";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ===================== TYPE ===================== */

interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  status: "กำลังตรวจสอบ" | "เสร็จสิ้น";
  createdAt?: Timestamp;
  imageUrl?: string; // ✅ รูปจาก Firebase Storage
  coordinates?: { lat: number; lng: number } | null;
}

type AdminDashboardProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

/* ===================== CONSTANT ===================== */

const INCIDENT_TYPE_TH: Record<string, string> = {
  fire: "ไฟไหม้",
  accident: "อุบัติเหตุ",
  flood: "น้ำท่วม",
  crime: "อาชญากรรม",
  other: "อื่น ๆ",
};

const getStatusColor = (status: string) =>
  status === "กำลังตรวจสอบ" ? "warning" : "success";

const defaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* ===================== COMPONENT ===================== */

export default function AdminDashboard({
  mode,
  toggleTheme,
}: AdminDashboardProps) {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDetail, setOpenDetail] = useState(false);
  const [detailIncident, setDetailIncident] =
    useState<Incident | null>(null);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] =
    useState<"success" | "error">("success");

<<<<<<< HEAD
  // Auth guard
=======
  /* ===================== AUTH GUARD ===================== */
>>>>>>> upstream/develop
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/admin/login");
    });
    return () => unsub();
  }, [navigate]);

  /* ===================== FETCH DATA ===================== */
  useEffect(() => {
    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setIncidents(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Incident))
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* ===================== ACTION ===================== */

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  const handleMarkDone = async (id: string) => {
    await updateDoc(doc(db, "incidents", id), { status: "เสร็จสิ้น" });
    setSnackMsg("อัปเดตสถานะเรียบร้อย");
    setSnackSeverity("success");
    setSnackOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("ต้องการลบเหตุการณ์นี้หรือไม่?")) return;
    await deleteDoc(doc(db, "incidents", id));
    setSnackMsg("ลบเหตุการณ์แล้ว");
    setSnackSeverity("success");
    setSnackOpen(true);
  };

  const handleViewDetail = (incident: Incident) => {
    setDetailIncident(incident);
    setOpenDetail(true);
  };

  /* ===================== PAGINATION ===================== */

  const paginated = incidents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  /* ===================== RENDER ===================== */

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight="bold" mb={2}>
            Admin Dashboard
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ประเภท</TableCell>
                      <TableCell>รายละเอียด</TableCell>
                      <TableCell>สถานที่</TableCell>
                      <TableCell align="center">สถานะ</TableCell>
                      <TableCell align="center">จัดการ</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginated.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          {INCIDENT_TYPE_TH[row.type] ?? row.type}
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
                        <TableCell align="center">
                          <Tooltip title="ดูรายละเอียด">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewDetail(row)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="เสร็จสิ้น">
                            <IconButton
                              color="success"
                              disabled={row.status === "เสร็จสิ้น"}
                              onClick={() => handleMarkDone(row.id)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="ลบ">
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(row.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={incidents.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) =>
                  setRowsPerPage(parseInt(e.target.value, 10))
                }
              />
            </>
          )}
        </Paper>
      </Container>

      {/* ===================== DETAIL DIALOG ===================== */}
      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>รายละเอียดเหตุการณ์</DialogTitle>

        <DialogContent dividers>
          {detailIncident && (
            <>
              <Typography fontWeight="bold" mb={1}>
                {INCIDENT_TYPE_TH[detailIncident.type] ??
                  detailIncident.type}
              </Typography>

              <Typography mb={2}>
                {detailIncident.description}
              </Typography>

              {/* รูป */}
              {detailIncident.imageUrl && (
                <Box
                  component="img"
                  src={detailIncident.imageUrl}
                  sx={{
                    width: "100%",
                    maxHeight: 350,
                    objectFit: "cover",
                    borderRadius: 2,
                    mb: 2,
                  }}
                />
              )}

              {/* แผนที่ */}
              {detailIncident.coordinates && (
                <Box sx={{ height: 300 }}>
                  <MapContainer
                    center={[
                      detailIncident.coordinates.lat,
                      detailIncident.coordinates.lng,
                    ]}
                    zoom={15}
                    style={{ height: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker
                      position={[
                        detailIncident.coordinates.lat,
                        detailIncident.coordinates.lng,
                      ]}
                      icon={defaultIcon}
                    />
                  </MapContainer>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>ปิด</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
      >
        <Alert severity={snackSeverity}>{snackMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
