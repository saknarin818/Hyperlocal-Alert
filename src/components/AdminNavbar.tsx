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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

// Firebase Auth
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export type AdminNavbarProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

const AdminNavbar: React.FC<AdminNavbarProps> = ({ mode, toggleTheme }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
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
        {/* Logo Admin */}
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
          Hyperlocal Community Alert
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

          <Button
            onClick={handleLogout}
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
              <OpenInNewIcon
                sx={{ mr: 1.5, fontSize: 20, color: "text.secondary" }}
              />{" "}
              ไปหน้าผู้ใช้งาน
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            <MenuItem
              onClick={() => {
                handleLogout();
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
                <LightModeIcon
                  sx={{ mr: 1.5, fontSize: 20, color: "warning.main" }}
                />
              ) : (
                <DarkModeIcon
                  sx={{ mr: 1.5, fontSize: 20, color: "primary.main" }}
                />
              )}
              {mode === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
