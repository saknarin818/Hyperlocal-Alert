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
  useTheme,
  useMediaQuery,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  where,
  Timestamp,
} from "firebase/firestore";

import Navbar from "../../components/Navbar";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* ===================== TYPE ===================== */

interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  status: "กำลังตรวจสอบ" | "เสร็จสิ้น";
  createdAt?: Timestamp;
  imageUrl?: string;
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
  other: "เหตุการณ์อื่น ๆ",
};

const getStatusColor = (status: string) =>
  status === "กำลังตรวจสอบ" ? "warning" : "success";

/* ===================== TIME ===================== */

const formatThaiTime = (timestamp?: Timestamp) => {
  if (!timestamp) return "-";
  return timestamp.toDate().toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/* ===================== COMPONENT ===================== */

export default function AdminDashboard({
  mode,
  toggleTheme,
}: AdminDashboardProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDetail, setOpenDetail] = useState(false);
  const [detailIncident, setDetailIncident] =
    useState<Incident | null>(null);

  const [notification, setNotification] = useState<{
    message: string;
    time: Timestamp;
  } | null>(null);

  /* ===================== AUTH ===================== */

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/admin/login");
    });
    return () => unsub();
  }, [navigate]);

  /* ===================== FIRESTORE ===================== */

  useEffect(() => {
    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));

    const unsubTable = onSnapshot(q, (snap) => {
      setIncidents(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Incident))
      );
      setLoading(false);
    });

    const qNotify = query(
      collection(db, "incidents"),
      where("status", "==", "กำลังตรวจสอบ"),
      orderBy("createdAt", "desc")
    );

    const unsubNotify = onSnapshot(qNotify, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const time = data.createdAt as Timestamp;
          if (!time) return;

          if (Date.now() - time.toDate().getTime() < 15000) {
            setNotification({
              message: `มีเหตุการณ์ใหม่: ${
                INCIDENT_TYPE_TH[data.type] ?? data.type
              }`,
              time,
            });
          }
        }
      });
    });

    return () => {
      unsubTable();
      unsubNotify();
    };
  }, []);

  /* ===================== ACTION ===================== */

  const handleMarkDone = async (id: string) => {
    await updateDoc(doc(db, "incidents", id), {
      status: "เสร็จสิ้น",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("ต้องการลบเหตุการณ์นี้หรือไม่?")) return;
    await deleteDoc(doc(db, "incidents", id));
  };

  const handleViewDetail = (incident: Incident) => {
    setDetailIncident(incident);
    setOpenDetail(true);
  };

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
              {/* ================= MOBILE ================= */}
              {isMobile ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {paginated.map((row) => (
                    <Paper key={row.id} sx={{ p: 2, borderRadius: 2 }}>
                      <Typography fontWeight="bold">
                        {INCIDENT_TYPE_TH[row.type]}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {row.description}
                      </Typography>

                      <Typography variant="body2" mt={1}>
                        📍 {row.location}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        🕒 {formatThaiTime(row.createdAt)}
                      </Typography>

                      <Box mt={1}>
                        <Chip
                          label={row.status}
                          color={getStatusColor(row.status)}
                          size="small"
                        />
                      </Box>

                      <Box
                        mt={1.5}
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        <IconButton onClick={() => handleViewDetail(row)}>
                          <VisibilityIcon sx={{ color: "primary.main" }} />
                        </IconButton>

                        <IconButton
                          color="success"
                          disabled={row.status === "เสร็จสิ้น"}
                          onClick={() => handleMarkDone(row.id)}
                        >
                          <CheckCircleIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => handleDelete(row.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                /* ================= DESKTOP ================= */
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ประเภท</TableCell>
                        <TableCell>รายละเอียด</TableCell>
                        <TableCell>สถานที่</TableCell>
                        <TableCell>เวลาแจ้งเหตุ</TableCell>
                        <TableCell align="center">สถานะ</TableCell>
                        <TableCell align="center">จัดการ</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginated.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            {INCIDENT_TYPE_TH[row.type]}
                          </TableCell>
                          <TableCell>{row.description}</TableCell>
                          <TableCell>{row.location}</TableCell>
                          <TableCell>
                            {formatThaiTime(row.createdAt)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={row.status}
                              color={getStatusColor(row.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            
                            <IconButton onClick={() => handleViewDetail(row)}>
                              <VisibilityIcon sx={{ color: "primary.main" }} />
                            </IconButton>

                            <IconButton
                              color="success"
                              disabled={row.status === "เสร็จสิ้น"}
                              onClick={() => handleMarkDone(row.id)}
                            >
                              <CheckCircleIcon />
                            </IconButton>

                            <IconButton
                              color="error"
                              onClick={() => handleDelete(row.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

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

      {/* ================= DETAIL ================= */}

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
              <Typography fontWeight="bold">
                {INCIDENT_TYPE_TH[detailIncident.type]}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                เวลาแจ้งเหตุ: {formatThaiTime(detailIncident.createdAt)}
              </Typography>

              <Typography my={2}>
                {detailIncident.description}
              </Typography>

              {detailIncident.imageUrl && (
                <Box
                  component="img"
                  src={detailIncident.imageUrl}
                  sx={{
                    width: "100%",
                    maxHeight: { xs: 240, md: 350 },
                    objectFit: "contain",
                    bgcolor: "#000",
                    borderRadius: 2,
                    mb: 2,
                  }}
                />
              )}

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

      {/* ================= NOTIFICATION ================= */}

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="info">
          <Typography fontWeight="bold">
            {notification?.message}
          </Typography>
          <Typography variant="caption">
            {formatThaiTime(notification?.time)}
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}
