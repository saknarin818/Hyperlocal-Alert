import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, Stack, IconButton,
  Menu, MenuItem, Box, Tooltip, Divider, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItemButton, ListItemIcon, ListItemText
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone"; // ไอคอนเบอร์โทร
import LocalHospitalIcon from "@mui/icons-material/LocalHospital"; // ไอคอนโรงพยาบาล
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment"; // ไอคอนดับเพลิง
import LocalPoliceIcon from "@mui/icons-material/LocalPolice"; // ไอคอนตำรวจ

import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";

// 👉 1. นำเข้าโมดูลเพิ่มเติมสำหรับการลบ Token แจ้งเตือน
import { auth, db, messaging } from "../firebase";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { getToken, deleteToken } from "firebase/messaging";

export type NavbarProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ mode, toggleTheme }) => {
  const theme = useTheme();
  const { user, role } = useAuth(); 

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  
  // State สำหรับควบคุม Dialog
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openEmergencyDialog, setOpenEmergencyDialog] = useState(false);

  const isDark = mode === "dark";

  // 👉 2. อัปเดตฟังก์ชัน handleLogout ให้จัดการลบ Token ก่อนออกจากระบบ
  const handleLogout = async () => {
    try {
      if (user && messaging) {
        try {
          // ดึง Token ปัจจุบันที่ใช้งานอยู่
          const currentToken = await getToken(messaging, {
            vapidKey: "BIYi3H95nrSpdpGyNcwmvxyV5k3opxt6a_mR94aleJW-_upDQEaCeAhzwtYOGABnMxP2Wt7gZoohfiyomwOSzyo"
          });

          if (currentToken) {
            // ลบ Token ปัจจุบันออกจากฐานข้อมูลผู้ใช้ (เพื่อให้หลังบ้านเลิกส่ง)
            await updateDoc(doc(db, "users", user.uid), {
              fcmTokens: arrayRemove(currentToken)
            });
            // ลบ Token ออกจากเครื่องเบราว์เซอร์ (เพื่อให้เลิกรับการแจ้งเตือน)
            await deleteToken(messaging);
          }
        } catch (pushErr) {
          console.error("เกิดข้อผิดพลาดในการลบ Token แจ้งเตือน: ", pushErr);
        }
      }

      await signOut(auth);
      setOpenLogoutDialog(false); 
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: "blur(8px)",
          bgcolor: isDark ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.8)",
          borderBottom: "1px solid",
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo */}
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{
              textDecoration: "none",
              fontWeight: 800,
              color: isDark ? "#38bdf8" : theme.palette.primary.main,
            }}
          >
            HCAS
          </Typography>

          {/* Desktop Menu */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {/* 🔹 ปุ่มเบอร์ฉุกเฉิน Desktop */}
            <Button 
              onClick={() => setOpenEmergencyDialog(true)} 
              color="error" 
              startIcon={<LocalPhoneIcon />}
              sx={{ fontWeight: "bold" }}
            >
              เบอร์ฉุกเฉิน
            </Button>

            <Button component={Link} to="/event" color="inherit">ดูเหตุการณ์</Button>
            
            {user && (
              <>
                <Button component={Link} to="/report" color="inherit">แจ้งเหตุ</Button>
                <Button component={Link} to="/history" color="inherit">สถิติ</Button>
              </>
            )}

            {/* ส่วนของ Auth (ล็อกอิน / โปรไฟล์) */}
            {!user ? (
              <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
                <Button component={Link} to="/login" variant="text">เข้าสู่ระบบ</Button>
                <Button component={Link} to="/register" variant="contained" sx={{ borderRadius: "999px" }}>สมัครสมาชิก</Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1 }}>
                {role === "admin" && (
                  <IconButton component={Link} to="/admin/dashboard" color="primary">
                    <AdminPanelSettingsIcon />
                  </IconButton>
                )}

                <Tooltip title="โปรไฟล์">
                  <IconButton component={Link} to="/profile" sx={{ p: 0.5 }}>
                    <Avatar 
                      src={user?.photoURL || ""} 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        border: "2px solid #38bdf8",
                        bgcolor: "#2563eb"
                      }}
                    >
                      {!user?.photoURL && <PersonIcon />}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Tooltip title="ออกจากระบบ">
                  <IconButton onClick={() => setOpenLogoutDialog(true)} color="error">
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}

            {/* ปุ่มเปลี่ยนโหมด (Theme Toggle) */}
            <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 2 }}>
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

          </Stack>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
            
            {/* 🔹 ปุ่มเบอร์ฉุกเฉินย้ายมาอยู่ข้างนอกตรงนี้ (สำหรับ Mobile) */}
            <Button 
              onClick={() => setOpenEmergencyDialog(true)} 
              color="error" 
              size="small"
              sx={{ fontWeight: "bold", mr: 1, borderRadius: "999px", bgcolor: isDark ? "rgba(244, 67, 54, 0.1)" : "rgba(244, 67, 54, 0.1)" }}
            >
              <LocalPhoneIcon sx={{ mr: 0.5, fontSize: 18 }} />
              ฉุกเฉิน
            </Button>

            <IconButton onClick={(e) => setAnchorElNav(e.currentTarget)} color="inherit">
              {user ? (
                <Avatar src={user?.photoURL || ""} sx={{ width: 32, height: 32 }} />
              ) : (
                <MenuIcon />
              )}
            </IconButton>

            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={() => setAnchorElNav(null)}
              PaperProps={{ sx: { width: 220, mt: 1.5 } }}
            >
              <MenuItem component={Link} to="/event" onClick={() => setAnchorElNav(null)}>ดูเหตุการณ์</MenuItem>
              
              {user && (
                <>
                  <MenuItem component={Link} to="/report" onClick={() => setAnchorElNav(null)}>แจ้งเหตุ</MenuItem>
                  <MenuItem component={Link} to="/history" onClick={() => setAnchorElNav(null)}>สถิติ</MenuItem>
                </>
              )}
              
              <Divider />
              {!user ? (
                <Box>
                  <MenuItem component={Link} to="/login">เข้าสู่ระบบ</MenuItem>
                  <MenuItem component={Link} to="/register">สมัครสมาชิก</MenuItem>
                </Box>
              ) : (
                <Box>
                  <MenuItem component={Link} to="/profile" onClick={() => setAnchorElNav(null)}>โปรไฟล์</MenuItem>
                  {role === "admin" && <MenuItem component={Link} to="/admin/dashboard" onClick={() => setAnchorElNav(null)}>แผงควบคุมแอดมิน</MenuItem>}
                  
                  <MenuItem 
                    onClick={() => { 
                      setOpenLogoutDialog(true); 
                      setAnchorElNav(null); 
                    }} 
                    sx={{ color: "error.main" }}
                  >
                    ออกจากระบบ
                  </MenuItem>
                </Box>
              )}
              <Divider />
              {/* ปุ่มเปลี่ยนโหมดของ Mobile */}
              <MenuItem onClick={() => { toggleTheme(); setAnchorElNav(null); }}>
                {isDark ? "โหมดสว่าง" : "โหมดมืด"}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ================= EMERGENCY DIALOG (หน้าต่างเบอร์ฉุกเฉิน) ================= */}
      <Dialog
        open={openEmergencyDialog}
        onClose={() => setOpenEmergencyDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? "#1e293b" : "#fff",
            color: isDark ? "#fff" : "text.primary",
            borderRadius: 4,
            border: isDark ? "1px solid #334155" : "none",
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 800, bgcolor: "error.main", color: "#fff" }}>
          <LocalPhoneIcon />
          สายด่วนฉุกเฉิน
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ pt: 0 }}>
            {/* ตำรวจ 191 */}
            <ListItemButton component="a" href="tel:191">
              <ListItemIcon>
                <LocalPoliceIcon color="info" fontSize="large" />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="h6" fontWeight="bold">191</Typography>} 
                secondary={<Typography variant="body2" color={isDark ? "gray" : "textSecondary"}>แจ้งเหตุด่วนเหตุร้าย (เหตุก่ออาชญากรรม)</Typography>} 
              />
            </ListItemButton>
            <Divider />

            {/* แพทย์ฉุกเฉิน 1669 */}
            <ListItemButton component="a" href="tel:1669">
              <ListItemIcon>
                <LocalHospitalIcon color="success" fontSize="large" />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="h6" fontWeight="bold">1669</Typography>} 
                secondary={<Typography variant="body2" color={isDark ? "gray" : "textSecondary"}>เจ็บป่วยฉุกเฉิน / กู้ชีพกู้ภัย</Typography>} 
              />
            </ListItemButton>
            <Divider />

            {/* ดับเพลิง 199 */}
            <ListItemButton component="a" href="tel:199">
              <ListItemIcon>
                <LocalFireDepartmentIcon color="error" fontSize="large" />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="h6" fontWeight="bold">199</Typography>} 
                secondary={<Typography variant="body2" color={isDark ? "gray" : "textSecondary"}>แจ้งเหตุไฟไหม้ / ดับเพลิง / สัตว์มีพิษเข้าบ้าน</Typography>} 
              />
            </ListItemButton>
            <Divider />

            {/* อุบัติเหตุบนทางหลวง 1193 */}
            <ListItemButton component="a" href="tel:1193">
              <ListItemIcon>
                <LocalPhoneIcon color="warning" fontSize="large" />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="h6" fontWeight="bold">1193</Typography>} 
                secondary={<Typography variant="body2" color={isDark ? "gray" : "textSecondary"}>ตำรวจทางหลวง (อุบัติเหตุบนทางหลวง)</Typography>} 
              />
            </ListItemButton>
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button 
            onClick={() => setOpenEmergencyDialog(false)} 
            variant="contained"
            color="inherit"
            sx={{ 
              borderRadius: "999px",
              fontWeight: "bold",
              width: "100%",
              color: isDark ? "#000" : "#333"
            }}
          >
            ปิดหน้าต่าง
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= LOGOUT CONFIRMATION DIALOG ================= */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: isDark ? "#1e293b" : "#fff",
            color: isDark ? "#fff" : "text.primary",
            borderRadius: 4,
            border: isDark ? "1px solid #334155" : "none",
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 800 }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 32 }} />
          ยืนยันการออกจากระบบ
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: isDark ? "#94a3b8" : "text.secondary", mt: 1 }}>
            คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชีผู้ใช้ของคุณ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenLogoutDialog(false)} 
            sx={{ 
              color: isDark ? "#94a3b8" : "text.secondary", 
              fontWeight: "bold",
              borderRadius: "999px",
              px: 3
            }}
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="contained" 
            color="error" 
            sx={{ 
              borderRadius: "999px", 
              fontWeight: "bold",
              px: 3,
              boxShadow: "none"
            }}
          >
            ออกจากระบบ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;