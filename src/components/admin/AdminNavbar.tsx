import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

// Firebase Auth
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

export type AdminNavbarProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

const AdminNavbar: React.FC<AdminNavbarProps> = ({ mode, toggleTheme }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  // 🔹 1. State สำหรับเปิด/ปิดหน้าต่างถามยืนยัน
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  // 🔹 2. ฟังก์ชันนี้จะทำงานเมื่อกด "ออกจากระบบ" ในหน้าต่างยืนยันแล้วเท่านั้น
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setOpenLogoutDialog(false);
      navigate("/admin/login");
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
          bgcolor: theme.palette.background.paper,
          borderBottom: "1px solid",
          borderColor: theme.palette.divider,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{
              textDecoration: "none",
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            HCA
          </Typography>
          
          {/* ================= DESKTOP MENU ================= */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            <Button
              component={Link}
              to="/"
              startIcon={<OpenInNewIcon />}
              sx={{
                color: theme.palette.text.primary,
                "&:hover": { bgcolor: theme.palette.action.hover },
              }}
            >
              ไปหน้าผู้ใช้งาน
            </Button>

            {/* 🔹 3. ปุ่มนี้กดแล้วจะเปลี่ยน State ให้ Dialog เปิดขึ้นมา */}
            <Button
              onClick={() => setOpenLogoutDialog(true)}
              color="error"
              variant="outlined"
              startIcon={<LogoutIcon />}
              sx={{ borderRadius: 2, fontWeight: "bold" }}
            >
              ออกจากระบบ
            </Button>

            <Tooltip title="เปลี่ยนธีม">
              <IconButton
                onClick={toggleTheme}
                sx={{ color: theme.palette.text.primary }}
              >
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Stack>

          {/* ================= MOBILE MENU ================= */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              onClick={(e) => setAnchorElNav(e.currentTarget)}
              sx={{ color: theme.palette.text.primary }}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={() => setAnchorElNav(null)}
              PaperProps={{ sx: { width: 220, borderRadius: 3, mt: 1.5 } }}
            >
              <MenuItem
                component={Link}
                to="/"
                onClick={() => setAnchorElNav(null)}
              >
                <OpenInNewIcon sx={{ mr: 1.5, fontSize: 20, color: "text.secondary" }} />
                ไปหน้าผู้ใช้งาน
              </MenuItem>

              <Divider sx={{ my: 1 }} />

              {/* 🔹 4. ปุ่มออกจากระบบบนมือถือ กดแล้วเปิด Dialog */}
              <MenuItem
                onClick={() => {
                  setOpenLogoutDialog(true);
                  setAnchorElNav(null);
                }}
                sx={{ color: "error.main", fontWeight: "bold" }}
              >
                <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} /> ออกจากระบบ
              </MenuItem>

              <Divider sx={{ my: 1 }} />

              <MenuItem
                onClick={() => {
                  toggleTheme();
                  setAnchorElNav(null);
                }}
              >
                {mode === "dark" ? (
                  <LightModeIcon sx={{ mr: 1.5, fontSize: 20, color: "warning.main" }} />
                ) : (
                  <DarkModeIcon sx={{ mr: 1.5, fontSize: 20, color: "primary.main" }} />
                )}
                {mode === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 🔹 5. ส่วนของ Popup ถามยืนยัน (ตัวนี้ต้องอยู่ก่อน `</>`) */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3, p: 1, minWidth: 300 }
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "error.main" }}>
          ยืนยันการออกจากระบบ
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบจัดการ (Admin Dashboard)?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenLogoutDialog(false)} 
            sx={{ fontWeight: "bold", color: "text.secondary" }}
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="contained" 
            color="error" 
            sx={{ fontWeight: "bold", borderRadius: 2 }}
          >
            ออกจากระบบ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminNavbar;