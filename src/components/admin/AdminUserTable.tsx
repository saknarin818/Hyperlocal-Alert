// src/components/admin/AdminUserTable.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Collapse,
  IconButton
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// Helper function
function alpha(color: string, opacity: number) {
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
}

export type UserData = {
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
  photoURL?: string;
  lastOnline?: any; 
  [key: string]: any;
};

type AdminUserTableProps = {
  usersList: UserData[];
  isDark: boolean;
  incidents: any[]; // 🔹 รับข้อมูลเหตุการณ์ทั้งหมดเข้ามา
};

// 🔹 ฟังก์ชันเช็คสถานะออนไลน์
const checkIsOnline = (lastOnline: any) => {
  if (!lastOnline) return false;
  const time = lastOnline.toDate ? lastOnline.toDate().getTime() : new Date(lastOnline).getTime();
  return (Date.now() - time) < (5 * 60 * 1000); // ภายใน 5 นาที
};

// ==========================================
// 🔹 Component แยกสำหรับแต่ละแถว เพื่อให้พับเก็บ (Collapse) ได้แยกกัน
// ==========================================
function Row({ user, isDark, userIncidents }: { user: UserData; isDark: boolean; userIncidents: any[] }) {
  const [open, setOpen] = useState(false); // ควบคุมการเปิด/ปิด
  const isOnline = checkIsOnline(user.lastOnline);

  return (
    <React.Fragment>
      <TableRow 
        onClick={() => setOpen(!open)} // 🔹 1. สั่งให้กดได้ทั้งแถว
        sx={{ 
          "& > *": { borderBottom: "unset" }, 
          bgcolor: open ? (isDark ? alpha("#38bdf8", 0.05) : alpha("#1976d2", 0.05)) : "transparent", 
          transition: "0.2s",
          cursor: "pointer", // 🔹 2. เปลี่ยนเมาส์เป็นรูปนิ้วชี้ (ให้รู้ว่ากดได้)
          "&:hover": { bgcolor: isDark ? alpha("#fff", 0.05) : alpha("#000", 0.02) } // 🔹 3. เพิ่มเอฟเฟกต์ตอนเอาเมาส์ชี้
        }}
      >
        
        {/* ช่อง: ผู้ใช้งาน (ขยับมาเป็นคอลัมน์แรก) */}
        <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar src={user.photoURL} sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: isDark ? "#334155" : "#e2e8f0", color: isDark ? "#fff" : "#475569" }}>
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : "?"}
            </Avatar>
            <Box>
              <Typography fontWeight="bold" sx={{ color: isDark ? "#fff" : "text.primary", fontSize: { xs: "0.85rem", sm: "1rem" } }}>
                {user.displayName || "ไม่มีชื่อ"}
              </Typography>
              {/* โชว์จำนวนแจ้งเหตุบนมือถือให้เห็นง่ายๆ */}
              <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "text.secondary", display: { sm: "none" } }}>
                แจ้งเหตุ: {userIncidents.length} ครั้ง
              </Typography>
            </Box>
          </Box>
        </TableCell>

        {/* ช่อง: อีเมล (ซ่อนบนมือถือ) */}
        <TableCell sx={{ color: isDark ? "#cbd5e1" : "text.secondary", display: { xs: "none", sm: "table-cell" } }}>
          {user.email}
          <Typography variant="caption" display="block" color={isDark ? "#94a3b8" : "text.secondary"}>
            ประวัติการแจ้งเหตุ: {userIncidents.length} รายการ
          </Typography>
        </TableCell>

        {/* ช่อง: บทบาท */}
        <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
          <Chip 
            label={user.role === "admin" ? "ผู้ดูแล" : "สมาชิก"} 
            size="small"
            sx={{ 
              bgcolor: user.role === "admin" ? alpha("#a855f7", 0.15) : alpha("#3b82f6", 0.15),
              color: user.role === "admin" ? "#a855f7" : "#3b82f6",
              fontWeight: "bold",
              fontSize: { xs: "0.7rem", sm: "0.8125rem" } 
            }} 
          />
        </TableCell>

        {/* ช่อง: สถานะ */}
        <TableCell align="center" sx={{ p: { xs: 1, sm: 2 } }}>
          <Chip 
            label={isOnline ? "Online" : "Offline"} 
            size="small"
            sx={{ 
              bgcolor: isOnline ? alpha("#10b981", 0.15) : alpha("#64748b", 0.15),
              color: isOnline ? "#10b981" : (isDark ? "#94a3b8" : "#64748b"),
              fontWeight: "bold",
              border: isOnline ? "1px solid #10b981" : "none",
              fontSize: { xs: "0.7rem", sm: "0.8125rem" } 
            }} 
          />
        </TableCell>

        {/* 🔹 ปุ่มลูกศรเปิด/ปิด */}
        <TableCell align="right" sx={{ p: { xs: 1, sm: 2 }, width: 40 }}>
          <IconButton size="small" sx={{ color: isDark ? "#94a3b8" : "inherit" }}>
            {open ? <KeyboardArrowUpIcon color="primary" /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

      </TableRow>

      {/* ========================================== */}
      {/* 🔹 ส่วนที่ซ่อนอยู่ (จะขยายลงมาเมื่อผู้ใช้กด) */}
      {/* ========================================== */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, bgcolor: isDark ? "rgba(0,0,0,0.15)" : "#f8fafc", p: { xs: 1.5, sm: 2.5 }, borderRadius: 3, border: isDark ? "1px solid #334155" : "1px solid #e2e8f0" }}>
              <Typography variant="subtitle2" sx={{ color: isDark ? "#38bdf8" : "primary.main", fontWeight: "bold", mb: 1.5 }}>
                รายการแจ้งเหตุของ {user.displayName || "ผู้ใช้นี้"}
              </Typography>
              
              {userIncidents.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {userIncidents.map((inc, i) => (
                    <Box key={inc.id} sx={{ p: 1.5, bgcolor: isDark ? "#1e293b" : "#fff", borderRadius: 2, border: isDark ? "1px solid #334155" : "1px solid #e2e8f0" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: isDark ? "#fff" : "text.primary" }}>
                          {i+1}. {inc.type} 
                        </Typography>
                        <Chip 
                          label={inc.status} 
                          size="small" 
                          sx={{ height: 20, fontSize: "0.7rem", fontWeight: "bold", bgcolor: inc.status === "เสร็จสิ้น" ? alpha("#10b981", 0.15) : alpha("#f59e0b", 0.15), color: inc.status === "เสร็จสิ้น" ? "#10b981" : "#f59e0b" }} 
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "text.secondary", display: "block", mt: 0.5 }}>
                        📍 <strong>สถานที่:</strong> {inc.location}
                      </Typography>
                      <Typography variant="caption" sx={{ color: isDark ? "#64748b" : "text.secondary", display: "block" }}>
                        📅 <strong>วันที่:</strong> {inc.createdAt ? new Date(inc.createdAt.toDate()).toLocaleString("th-TH") : "ไม่ระบุเวลา"}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontStyle: "italic", textAlign: "center", py: 2 }}>
                  ยังไม่มีประวัติการแจ้งเหตุ
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// ==========================================
// 🔹 Component หลักของตาราง
// ==========================================
export default function AdminUserTable({ usersList, isDark, incidents }: AdminUserTableProps) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 4, bgcolor: isDark ? "#1e293b" : "#fff", border: isDark ? "1px solid #334155" : "none", boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)", animation: "fadeIn 0.5s ease" }}>
      <Table sx={{ width: "100%" }}>
        <TableHead sx={{ bgcolor: isDark ? "#0f172a" : "#f1f5f9" }}>
          <TableRow>
            <TableCell sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold" }}>ผู้ใช้งาน</TableCell>
            <TableCell sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold", display: { xs: "none", sm: "table-cell" } }}>อีเมล</TableCell>
            <TableCell sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold" }}>บทบาท</TableCell>
            <TableCell align="center" sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold" }}>สถานะ</TableCell>
            <TableCell /> {/* 🔹 ย้ายช่องว่างสำหรับลูกศรมาไว้ท้ายสุด */}
          </TableRow>
        </TableHead>
        <TableBody>
          {usersList.length > 0 ? (
            usersList.map((user) => {
              // 🔹 กรองเอาเฉพาะเหตุการณ์ที่ตรงกับรหัส (id) ของผู้ใช้คนนี้
              const userIncidents = incidents.filter(inc => inc.userId === user.id);
              
              return (
                <Row key={user.id} user={user} isDark={isDark} userIncidents={userIncidents} />
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4, color: isDark ? "#94a3b8" : "text.secondary" }}>
                ไม่พบข้อมูลผู้ใช้งาน
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}