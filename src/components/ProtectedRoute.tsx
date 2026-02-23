import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // เริ่มต้นให้สถานะเป็น 'loading' เพื่อรอเช็คข้อมูลจาก Firebase ก่อน
  const [user, setUser] = useState<any>("loading");

  useEffect(() => {
    // ดักฟังการเปลี่ยนแปลงสถานะ Login
    const unsub = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // 1. ระหว่างรอเช็คข้อมูล ให้แสดงโหลดดิ้งหมุนๆ กลางจอ
  if (user === "loading") {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="background.default">
        <CircularProgress />
      </Box>
    );
  }

  // 2. ถ้าเช็คแล้วพบว่า "ยังไม่ได้ล็อกอิน" (!user) ให้เตะไปหน้า login ทันที
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // 3. ถ้าล็อกอินแล้ว ให้ปล่อยผ่านไปดูหน้าจอที่ครอบไว้ (children) ได้เลย
  return <>{children}</>;
}