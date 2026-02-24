import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, Stack, IconButton,
  Menu, MenuItem, Box, Tooltip, Divider, Avatar,
  // 🔹 นำเข้าคอมโพเนนต์สำหรับทำ Dialog
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"; // ไอคอนสำหรับ Dialog

import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export type NavbarProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ mode, toggleTheme }) => {
  const theme = useTheme();
  const { user, role } = useAuth(); 

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  // 🔹 State สำหรับควบคุมการเปิด/ปิดหน้าต่างยืนยันการออกจากระบบ
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const isDark = mode === "dark";

  // 🔹 ฟังก์ชันออกจากระบบ (ทำงานเมื่อกดยืนยันใน Dialog)
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setOpenLogoutDialog(false); // ปิด Dialog หลังออกสำเร็จ
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
            HCA
          </Typography>

          {/* Desktop Menu */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            <Button component={Link} to="/event" color="inherit">ดูเหตุการณ์</Button>
            <Button component={Link} to="/history" color="inherit">สถิติ</Button>

            <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1 }}>
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

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

                {/* 👤 แสดง Avatar รูปโปรไฟล์ */}
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

                {/* 🔹 ปุ่มออกจากระบบ Desktop (กดแล้วเปิด Dialog) */}
                <Tooltip title="ออกจากระบบ">
                  <IconButton onClick={() => setOpenLogoutDialog(true)} color="error">
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
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
              PaperProps={{ sx: { width: 200, mt: 1.5 } }}
            >
              <MenuItem component={Link} to="/event" onClick={() => setAnchorElNav(null)}>ดูเหตุการณ์</MenuItem>
              <MenuItem component={Link} to="/history" onClick={() => setAnchorElNav(null)}>สถิติ</MenuItem>
              <Divider />
              {!user ? (
                <Box>
                  <MenuItem component={Link} to="/login">เข้าสู่ระบบ</MenuItem>
                  <MenuItem component={Link} to="/register">สมัครสมาชิก</MenuItem>
                </Box>
              ) : (
                <Box>
                  <MenuItem component={Link} to="/profile">โปรไฟล์</MenuItem>
                  {role === "admin" && <MenuItem component={Link} to="/admin/dashboard">แผงควบคุมแอดมิน</MenuItem>}
                  
                  {/* 🔹 ปุ่มออกจากระบบ Mobile (กดแล้วเปิด Dialog) */}
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
              <MenuItem onClick={() => { toggleTheme(); setAnchorElNav(null); }}>
                {isDark ? "โหมดสว่าง" : "โหมดมืด"}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

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