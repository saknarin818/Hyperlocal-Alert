// src/components/admin/AdminIncidentTypes.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { db } from "../../firebase"; // ตรวจสอบ path ของ firebase ให้ตรงกับโปรเจกต์คุณ
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";

type AdminIncidentTypesProps = {
  isDark: boolean;
};

export default function AdminIncidentTypes({ isDark }: AdminIncidentTypesProps) {
  const [types, setTypes] = useState<{ id: string; label: string }[]>([]);
  const [newType, setNewType] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูลประเภทเหตุการณ์มาแสดง
  useEffect(() => {
    const q = query(collection(db, "incidentTypes"), orderBy("label", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setTypes(snap.docs.map(d => ({ id: d.id, label: d.data().label })));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching types:", err);
      setError("ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบสิทธิ์ (Rules) ใน Firestore");
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ฟังก์ชันเพิ่มประเภทเหตุการณ์
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.trim()) return;
    setAdding(true);
    try {
      await addDoc(collection(db, "incidentTypes"), {
        label: newType.trim()
      });
      setNewType(""); // ล้างช่องกรอกข้อมูล
      setError(null);
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    } finally {
      setAdding(false);
    }
  };

  // ฟังก์ชันลบประเภทเหตุการณ์
  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบประเภท "${label}" ?`)) return;
    try {
      await deleteDoc(doc(db, "incidentTypes", id));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      color: isDark ? "#fff" : "inherit",
      borderRadius: "8px",
      "& fieldset": { borderColor: isDark ? "#334155" : "rgba(0, 0, 0, 0.23)" },
      "&:hover fieldset": { borderColor: "#38bdf8" },
      "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
    },
    "& .MuiInputLabel-root": { color: isDark ? "#94a3b8" : "text.secondary" },
  };

  return (
    <Box sx={{ animation: "fadeIn 0.5s ease" }}>
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 4, 
        bgcolor: isDark ? "#1e293b" : "#fff",
        border: isDark ? "1px solid #334155" : "none",
        boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)"
      }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: isDark ? "#fff" : "text.primary", mb: 2 }}>
          เพิ่มประเภทเหตุการณ์ใหม่
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleAdd} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="ชื่อประเภทเหตุการณ์ (เช่น สัตว์มีพิษเข้าบ้าน, ต้นไม้ล้ม)"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            fullWidth
            size="small"
            sx={inputStyle}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={adding || !newType.trim()}
            startIcon={adding ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            sx={{ 
              py: 1, px: 3, borderRadius: "8px", fontWeight: "bold",
              bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" },
              minWidth: "120px"
            }}
          >
            เพิ่ม
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ 
        borderRadius: 4, 
        bgcolor: isDark ? "#1e293b" : "#fff",
        border: isDark ? "1px solid #334155" : "none",
        boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)"
      }}>
        <Table>
          <TableHead sx={{ bgcolor: isDark ? "#0f172a" : "#f1f5f9" }}>
            <TableRow>
              <TableCell sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold" }}>ลำดับ</TableCell>
              <TableCell sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold", width: "100%" }}>ชื่อประเภทเหตุการณ์</TableCell>
              <TableCell align="center" sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold" }}>จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : types.length > 0 ? (
              types.map((type, index) => (
                <TableRow key={type.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell sx={{ color: isDark ? "#cbd5e1" : "text.secondary" }}>{index + 1}</TableCell>
                  <TableCell sx={{ color: isDark ? "#fff" : "text.primary", fontWeight: "bold" }}>
                    {type.label}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      onClick={() => handleDelete(type.id, type.label)} 
                      color="error"
                      sx={{ bgcolor: isDark ? "rgba(239, 68, 68, 0.1)" : "transparent" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: isDark ? "#94a3b8" : "text.secondary" }}>
                  ยังไม่มีข้อมูลประเภทเหตุการณ์
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}