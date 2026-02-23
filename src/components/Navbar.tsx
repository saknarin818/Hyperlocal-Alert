import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export type NavbarProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ mode, toggleTheme }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [role, setRole] = useState<string>("");

  // 🔹 โหลด role ถ้า login
  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole("");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setRole(snap.data().role || "");
      }
    };

    fetchRole();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const publicLinks = [
    { title: "ดูเหตุการณ์", href: "/event" },
    { title: "สถิติ", href: "/history" },
  ];

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
        {/* Logo */}
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

        {/* Desktop Menu */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {publicLinks.map((link) => (
            <Button
              key={link.href}
              component={Link}
              to={link.href}
              sx={{
                color: theme.palette.text.primary,
              }}
            >
              {link.title}
            </Button>
          ))}

          {!user && (
            <>
              <Button component={Link} to="/login">
                เข้าสู่ระบบ
              </Button>
              <Button component={Link} to="/register" variant="contained">
                สมัครสมาชิก
              </Button>
            </>
          )}

          {user && (
            <>
              <Button component={Link} to="/profile">
                โปรไฟล์
              </Button>

              {role === "admin" && (
                <Button component={Link} to="/admin" color="secondary">
                  Admin
                </Button>
              )}

              <Button color="error" onClick={handleLogout}>
                ออกจากระบบ
              </Button>
            </>
          )}

          {/* Theme Toggle */}
          <Tooltip title="เปลี่ยนธีม">
            <IconButton
              onClick={toggleTheme}
              sx={{ color: theme.palette.text.primary }}
            >
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Mobile Menu */}
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
          >
            {publicLinks.map((link) => (
              <MenuItem
                key={link.href}
                component={Link}
                to={link.href}
                onClick={() => setAnchorElNav(null)}
              >
                {link.title}
              </MenuItem>
            ))}

            {!user && (
              <>
                <MenuItem
                  component={Link}
                  to="/login"
                  onClick={() => setAnchorElNav(null)}
                >
                  เข้าสู่ระบบ
                </MenuItem>

                <MenuItem
                  component={Link}
                  to="/register"
                  onClick={() => setAnchorElNav(null)}
                >
                  สมัครสมาชิก
                </MenuItem>
              </>
            )}

            {user && (
              <>
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={() => setAnchorElNav(null)}
                >
                  โปรไฟล์
                </MenuItem>

                {role === "admin" && (
                  <MenuItem
                    component={Link}
                    to="/admin"
                    onClick={() => setAnchorElNav(null)}
                  >
                    Admin
                  </MenuItem>
                )}

                <MenuItem
                  onClick={() => {
                    handleLogout();
                    setAnchorElNav(null);
                  }}
                >
                  ออกจากระบบ
                </MenuItem>
              </>
            )}

            <MenuItem
              onClick={() => {
                toggleTheme();
                setAnchorElNav(null);
              }}
            >
              {mode === "dark" ? "Light Mode ☀️" : "Dark Mode 🌙"}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;