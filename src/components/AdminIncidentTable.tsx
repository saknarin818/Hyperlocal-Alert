import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

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

interface AdminIncidentTableProps {
  incidents: Incident[];
  loading: boolean;
}

const INCIDENT_TYPE_TH: Record<string, string> = {
  fire: "ไฟไหม้",
  accident: "อุบัติเหตุ",
  flood: "น้ำท่วม",
  crime: "อาชญากรรม",
  other: "เหตุการณ์อื่น ๆ",
};

const getStatusColor = (status: string) =>
  status === "กำลังตรวจสอบ" ? "warning" : "success";

const formatThaiTime = (timestamp?: Timestamp) => {
  if (!timestamp) return "-";
  return timestamp.toDate().toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function AdminIncidentTable({ incidents, loading }: AdminIncidentTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailIncident, setDetailIncident] = useState<Incident | null>(null);

  const handleMarkDone = async (id: string) => {
    await updateDoc(doc(db, "incidents", id), { status: "เสร็จสิ้น" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("ต้องการลบเหตุการณ์นี้หรือไม่?")) return;
    await deleteDoc(doc(db, "incidents", id));
  };

  const handleViewDetail = (incident: Incident) => {
    setDetailIncident(incident);
    setOpenDetail(true);
  };

  const paginated = incidents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3, animation: "fadeIn 0.3s" }}>
      {isMobile ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {paginated.map((row) => (
            <Paper key={row.id} sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }} elevation={2}>
              <Typography fontWeight="bold">{INCIDENT_TYPE_TH[row.type] || row.type}</Typography>
              <Typography variant="body2" color="text.secondary">{row.description}</Typography>
              <Typography variant="body2" mt={1}>📍 {row.location}</Typography>
              <Typography variant="caption" color="text.secondary">🕒 {formatThaiTime(row.createdAt)}</Typography>
              <Box mt={1}>
                <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
              </Box>
              <Box mt={1.5} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <IconButton onClick={() => handleViewDetail(row)}>
                  <VisibilityIcon sx={{ color: "primary.main" }} />
                </IconButton>
                <IconButton color="success" disabled={row.status === "เสร็จสิ้น"} onClick={() => handleMarkDone(row.id)}>
                  <CheckCircleIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(row.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>ประเภท</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>รายละเอียด</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>สถานที่</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>เวลาแจ้งเหตุ</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>สถานะ</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{INCIDENT_TYPE_TH[row.type] || row.type}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{formatThaiTime(row.createdAt)}</TableCell>
                  <TableCell align="center">
                    <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleViewDetail(row)}>
                      <VisibilityIcon sx={{ color: "primary.main" }} />
                    </IconButton>
                    <IconButton color="success" disabled={row.status === "เสร็จสิ้น"} onClick={() => handleMarkDone(row.id)}>
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row.id)}>
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
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        labelRowsPerPage="จำนวนต่อหน้า:"
      />

      {/* DIALOG รายละเอียด */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>รายละเอียดเหตุการณ์</DialogTitle>
        <DialogContent dividers>
          {detailIncident && (
            <>
              <Typography fontWeight="bold">{INCIDENT_TYPE_TH[detailIncident.type] || detailIncident.type}</Typography>
              <Typography variant="caption" color="text.secondary">เวลาแจ้งเหตุ: {formatThaiTime(detailIncident.createdAt)}</Typography>
              <Typography my={2}>{detailIncident.description}</Typography>
              {detailIncident.imageUrl && (
                <Box component="img" src={detailIncident.imageUrl} sx={{ width: "100%", maxHeight: { xs: 240, md: 350 }, objectFit: "contain", bgcolor: "#000", borderRadius: 2, mb: 2 }} />
              )}
              {detailIncident.coordinates && (
                <Box sx={{ height: 300, borderRadius: 2, overflow: "hidden" }}>
                  <MapContainer center={[detailIncident.coordinates.lat, detailIncident.coordinates.lng]} zoom={15} style={{ height: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[detailIncident.coordinates.lat, detailIncident.coordinates.lng]} />
                  </MapContainer>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)} variant="contained" color="primary">ปิด</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}