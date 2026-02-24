// src/components/AdminUserTable.tsx
import React from "react";
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
  Chip
} from "@mui/material";

// Helper function สำหรับจัดการสีโปร่งใส
function alpha(color: string, opacity: number) {
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
}

// 🔹 ประกาศ Type ให้ถูกต้อง เพื่อไม่ให้ TypeScript บ่น (แก้ Error ts 2339)
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
};

export default function AdminUserTable({ usersList, isDark }: AdminUserTableProps) {
  
  // ฟังก์ชันเช็คสถานะออนไลน์รายคน
  const checkIsOnline = (lastOnline: any) => {
    if (!lastOnline) return false;
    const time = lastOnline.toDate ? lastOnline.toDate().getTime() : new Date(lastOnline).getTime();
    return (Date.now() - time) < (5 * 60 * 1000); // เช็คภายใน 5 นาที
  };

  return (
    <TableContainer component={Paper} sx={{ 
      borderRadius: 4, 
      bgcolor: isDark ? "#1e293b" : "#fff",
      border: isDark ? "1px solid #334155" : "none",
      boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
      animation: "fadeIn 0.5s ease"
    }}>
      <Table>
        <TableHead sx={{ bgcolor: isDark ? "#0f172a" : "#f1f5f9" }}>
          <TableRow>
            <TableCell sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold" }}>ผู้ใช้งาน</TableCell>
            <TableCell sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold" }}>อีเมล</TableCell>
            <TableCell sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold" }}>บทบาท</TableCell>
            <TableCell align="center" sx={{ color: isDark ? "#94a3b8" : "text.secondary", fontWeight: "bold" }}>สถานะ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usersList.length > 0 ? (
            usersList.map((user) => {
              const isOnline = checkIsOnline(user.lastOnline);
              return (
                <TableRow key={user.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar src={user.photoURL} sx={{ bgcolor: isDark ? "#334155" : "#e2e8f0", color: isDark ? "#fff" : "#475569" }}>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : "?"}
                      </Avatar>
                      <Typography fontWeight="bold" sx={{ color: isDark ? "#fff" : "text.primary" }}>
                        {user.displayName || "ไม่มีชื่อ"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: isDark ? "#cbd5e1" : "text.secondary" }}>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งานทั่วไป"} 
                      size="small"
                      sx={{ 
                        bgcolor: user.role === "admin" ? alpha("#a855f7", 0.15) : alpha("#3b82f6", 0.15),
                        color: user.role === "admin" ? "#a855f7" : "#3b82f6",
                        fontWeight: "bold"
                      }} 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={isOnline ? "Online" : "Offline"} 
                      size="small"
                      sx={{ 
                        bgcolor: isOnline ? alpha("#10b981", 0.15) : alpha("#64748b", 0.15),
                        color: isOnline ? "#10b981" : (isDark ? "#94a3b8" : "#64748b"),
                        fontWeight: "bold",
                        border: isOnline ? "1px solid #10b981" : "none"
                      }} 
                    />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4, color: isDark ? "#94a3b8" : "text.secondary" }}>
                ไม่พบข้อมูลผู้ใช้งาน
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}