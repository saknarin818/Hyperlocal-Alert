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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
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
  DocumentData,
} from "firebase/firestore";
import Navbar from "../../components/Navbar";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// สร้าง Type สำหรับข้อมูลเหตุการณ์
interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  contact?: string; // <-- เพิ่ม contact
  status: "กำลังตรวจสอบ" | "เสร็จสิ้น";
  createdAt?: Timestamp | any;
  coordinates?: { lat: number; lng: number } | null;
  images?: string[];
  [key: string]: any;
}

const getStatusColor = (status: string) => {
  return status === "กำลังตรวจสอบ" ? "warning" : "success";
};

const defaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Detail dialog
  const [openDetail, setOpenDetail] = useState(false);
  const [detailIncident, setDetailIncident] = useState<Incident | null>(null);

  // Snackbar
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("success");

  // Auth guard
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/admin/login");
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  // Real-time listener
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => {
          const raw = d.data() as DocumentData;
          return {
            id: d.id,
            ...raw,
          } as Incident;
        });
        setIncidents(data);
        setLoading(false);
      },
      (error) => {
        console.error("onSnapshot error:", error);
        setSnackMsg("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setSnackSeverity("error");
        setSnackOpen(true);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Derived & filtered
  const filtered = incidents.filter((inc) => {
    if (filterType !== "all" && inc.type !== filterType) return false;
    if (filterStatus !== "all" && inc.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      const inText =
        (inc.type || "").toString().toLowerCase().includes(s) ||
        (inc.description || "").toString().toLowerCase().includes(s) ||
        (inc.location || "").toString().toLowerCase().includes(s) ||
        (inc.contact || "").toString().toLowerCase().includes(s);
      return inText;
    }
    return true;
  });

  // Pagination slice
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Actions
  const handleApprove = async (id: string) => {
    try {
      const incidentRef = doc(db, "incidents", id);
      await updateDoc(incidentRef, { status: "เสร็จสิ้น" });
      setSnackMsg("อนุมัติเหตุการณ์เรียบร้อย");
      setSnackSeverity("success");
      setSnackOpen(true);
    } catch (error) {
      console.error("Error approving incident: ", error);
      setSnackMsg("ไม่สามารถอนุมัติเหตุการณ์ได้");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเหตุการณ์นี้?")) return;
    try {
      const incidentRef = doc(db, "incidents", id);
      await deleteDoc(incidentRef);
      setSnackMsg("ลบเหตุการณ์เรียบร้อย");
      setSnackSeverity("success");
      setSnackOpen(true);
      setSelectedIds((s) => s.filter((x) => x !== id));
    } catch (error) {
      console.error("Error deleting incident: ", error);
      setSnackMsg("ไม่สามารถลบเหตุการณ์ได้");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const handleApproveBulk = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateDoc(doc(db, "incidents", id), { status: "เสร็จสิ้น" })
        )
      );
      setSnackMsg("อนุมัติรายการที่เลือกแล้ว");
      setSnackSeverity("success");
      setSnackOpen(true);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error bulk approve:", error);
      setSnackMsg("ไม่สามารถอนุมัติรายการได้");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`ลบ ${selectedIds.length} รายการที่เลือก?`)) return;
    try {
      await Promise.all(
        selectedIds.map((id) => deleteDoc(doc(db, "incidents", id)))
      );
      setSnackMsg("ลบรายการที่เลือกแล้ว");
      setSnackSeverity("success");
      setSnackOpen(true);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error bulk delete:", error);
      setSnackMsg("ไม่สามารถลบรายการได้");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  // Row selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  // Detail dialog
  const openDetailDialog = (inc: Incident) => {
    setDetailIncident(inc);
    setOpenDetail(true);
  };

  const closeDetailDialog = () => {
    setDetailIncident(null);
    setOpenDetail(false);
  };

  // Pagination handlers
  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error("Error signing out: ", error);
      setSnackMsg("ออกจากระบบไม่สำเร็จ");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f4f6f8",
        flexDirection: "column",
      }}
    >
      <Navbar />
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
            <Box>
              <Button
                variant="contained"
                color="error"
                onClick={handleLogout}
                sx={{ ml: 1 }}
              >
                ออกจากระบบ
              </Button>
            </Box>
          </Box>

          {/* Controls: search / filters / bulk actions */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              mb: 2,
            }}
          >
            <TextField
              placeholder="ค้นหา (ประเภท, รายละเอียด, สถานที่, ติดต่อ)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ minWidth: 300 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>ประเภท</InputLabel>
              <Select
                value={filterType}
                label="ประเภท"
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                {/* Dynamically list types */}
                {Array.from(new Set(incidents.map((i) => i.type))).map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>สถานะ</InputLabel>
              <Select
                value={filterStatus}
                label="สถานะ"
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="กำลังตรวจสอบ">กำลังตรวจสอบ</MenuItem>
                <MenuItem value="เสร็จสิ้น">เสร็จสิ้น</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleApproveBulk}
                disabled={selectedIds.length === 0}
              >
                อนุมัติที่เลือก ({selectedIds.length})
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteBulk}
                disabled={selectedIds.length === 0}
              >
                ลบที่เลือก ({selectedIds.length})
              </Button>
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
            รายการเหตุการณ์ ({filtered.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="incidents table">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedIds.length > 0 &&
                            selectedIds.length < filtered.length
                          }
                          checked={
                            filtered.length > 0 &&
                            selectedIds.length === filtered.length
                          }
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedIds(filtered.map((r) => r.id));
                            else setSelectedIds([]);
                          }}
                          inputProps={{ "aria-label": "select all incidents" }}
                        />
                      </TableCell>
                      <TableCell>ประเภท</TableCell>
                      <TableCell>รายละเอียด</TableCell>
                      <TableCell>สถานที่</TableCell>
                      <TableCell>ข้อมูลติดต่อ</TableCell>
                      <TableCell align="center">สถานะ</TableCell>
                      <TableCell>เวลาที่แจ้ง</TableCell>
                      <TableCell align="center">จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map((row) => {
                      const createdAtStr = row.createdAt?.toDate
                        ? row.createdAt.toDate().toLocaleString("th-TH")
                        : row.createdAt || "-";
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected(row.id)}
                              onChange={() => toggleSelect(row.id)}
                            />
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {row.type}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 300, wordBreak: "break-word" }}>
                            {row.description}
                          </TableCell>
                          <TableCell>{row.location}</TableCell>
                          <TableCell>{row.contact || "-"}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={row.status}
                              color={getStatusColor(row.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{createdAtStr}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="ดูรายละเอียด">
                              <IconButton
                                onClick={() => openDetailDialog(row)}
                                aria-label="view"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            {row.status === "กำลังตรวจสอบ" && (
                              <Tooltip title="อนุมัติ">
                                <IconButton
                                  color="success"
                                  onClick={() => handleApprove(row.id)}
                                  aria-label="approve"
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="ลบ">
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(row.id)}
                                aria-label="delete"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </Paper>
      </Container>

      {/* Detail Dialog */}
      <Dialog
        open={openDetail}
        onClose={closeDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>รายละเอียดเหตุการณ์</DialogTitle>
        <DialogContent dividers>
          {detailIncident ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {detailIncident.type}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {detailIncident.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                สถานที่: {detailIncident.location}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ติดต่อ: {detailIncident.contact || "-"}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                เวลา:{" "}
                {detailIncident.createdAt?.toDate
                  ? detailIncident.createdAt.toDate().toLocaleString("th-TH")
                  : "-"}
              </Typography>

              {detailIncident?.coordinates &&
                Number.isFinite(detailIncident.coordinates.lat) &&
                Number.isFinite(detailIncident.coordinates.lng) && (
                  <Box sx={{ height: 300, mt: 2 }}>
                    <MapContainer
                      center={[
                        detailIncident.coordinates.lat,
                        detailIncident.coordinates.lng,
                      ]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={false}
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

              {/* images preview (if any) */}
              {detailIncident.images && detailIncident.images.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {detailIncident.images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`img-${idx}`}
                      style={{
                        maxWidth: 150,
                        borderRadius: 6,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Typography>ไม่มีข้อมูล</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailDialog}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
      >
        <Alert
          severity={snackSeverity}
          onClose={() => setSnackOpen(false)}
          sx={{ width: "100%" }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
