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

interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  contact?: string;
  status: "กำลังตรวจสอบ" | "เสร็จสิ้น";
  createdAt?: Timestamp | any;
  coordinates?: { lat: number; lng: number } | null;
  images?: string[];
}

type AdminDashboardProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

const getStatusColor = (status: string) =>
  status === "กำลังตรวจสอบ" ? "warning" : "success";

const defaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function AdminDashboard({
  mode,
  toggleTheme,
}: AdminDashboardProps) {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDetail, setOpenDetail] = useState(false);
  const [detailIncident, setDetailIncident] = useState<Incident | null>(null);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] =
    useState<"success" | "info" | "warning" | "error">("success");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/admin/login");
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setIncidents(
        snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Incident)
        )
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const INCIDENT_TYPE_TH: Record<string, string> = {
    fire: "ไฟไหม้",
    accident: "อุบัติเหตุ",
    flood: "น้ำท่วม",
    crime: "อาชญากรรม",
    electricity: "ไฟฟ้าขัดข้อง",
    water: "ประปาขัดข้อง",
    earthquake: "แผ่นดินไหว",
    storm: "พายุ",
    other: "อื่น ๆ",
  };

  const filtered = incidents.filter((i) => {
    if (filterType !== "all" && i.type !== filterType) return false;
    if (filterStatus !== "all" && i.status !== filterStatus) return false;

    if (search) {
      const s = search.toLowerCase();

      const typeEn = i.type?.toLowerCase() ?? "";
      const typeTh =
        i.type && INCIDENT_TYPE_TH[i.type]
          ? INCIDENT_TYPE_TH[i.type].toLowerCase()
          : "";

      return (
        typeEn.includes(s) ||
        typeTh.includes(s) ||
        i.description?.toLowerCase().includes(s) ||
        i.location?.toLowerCase().includes(s) ||
        i.contact?.toLowerCase().includes(s)
      );
    }

    return true;
  });

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };


  const handleMarkDone = async (id: string) => {
    try {
      await updateDoc(doc(db, "incidents", id), {
        status: "เสร็จสิ้น",
      });
      setSnackMsg("อัปเดตสถานะเป็นเสร็จสิ้นแล้ว");
      setSnackSeverity("success");
      setSnackOpen(true);
    } catch (e) {
      setSnackMsg("เกิดข้อผิดพลาด");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("ต้องการลบเหตุการณ์นี้หรือไม่?")) return;
    try {
      await deleteDoc(doc(db, "incidents", id));
      setSnackMsg("ลบเหตุการณ์เรียบร้อย");
      setSnackSeverity("success");
      setSnackOpen(true);
    } catch (e) {
      setSnackMsg("ลบไม่สำเร็จ");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Admin Dashboard
            </Typography>
            <Button color="error" variant="contained" onClick={handleLogout}>
              ออกจากระบบ
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
            <TextField
              size="small"
              placeholder="ค้นหา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 280 }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>ประเภท</InputLabel>
              <Select
                label="ประเภท"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>

                {Array.from(
                  new Set(
                    incidents
                      .map((i) => i.type)
                      .filter((t): t is string => Boolean(t))
                  )
                ).map((t) => (
                  <MenuItem key={t} value={t}>
                    {INCIDENT_TYPE_TH[t] ?? t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>สถานะ</InputLabel>
              <Select
                label="สถานะ"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="กำลังตรวจสอบ">กำลังตรวจสอบ</MenuItem>
                <MenuItem value="เสร็จสิ้น">เสร็จสิ้น</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: "center", my: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell>ประเภท</TableCell>
                      <TableCell>รายละเอียด</TableCell>
                      <TableCell>สถานที่</TableCell>
                      <TableCell>ติดต่อ</TableCell>
                      <TableCell align="center">สถานะ</TableCell>
                      <TableCell>เวลา</TableCell>
                      <TableCell align="center">จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          {INCIDENT_TYPE_TH[row.type] ?? row.type}
                        </TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>{row.location}</TableCell>
                        <TableCell>{row.contact || "-"}</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={row.status}
                            color={getStatusColor(row.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {row.createdAt?.toDate
                            ? row.createdAt
                              .toDate()
                              .toLocaleString("th-TH")
                            : "-"}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="ทำเครื่องหมายว่าเสร็จสิ้น">
                            <span>
                              <IconButton
                                color="success"
                                disabled={row.status === "เสร็จสิ้น"}
                                onClick={() => handleMarkDone(row.id)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="ลบเหตุการณ์">
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
                count={filtered.length}
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

      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: "background.paper" } }}
      >
        <DialogTitle>รายละเอียดเหตุการณ์</DialogTitle>
        <DialogContent dividers>
          {detailIncident && (
            <>
              <Typography fontWeight="bold">
                {INCIDENT_TYPE_TH[detailIncident.type] ?? detailIncident.type}
              </Typography>
              <Typography>{detailIncident.description}</Typography>

              {detailIncident.coordinates && (
                <Box sx={{ height: 300, mt: 2 }}>
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
        <Alert
          severity={snackSeverity}
          onClose={() => setSnackOpen(false)}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
