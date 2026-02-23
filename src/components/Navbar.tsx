import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, Stack, IconButton,
  Menu, MenuItem, Box, Tooltip, Divider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

export type NavbarProps = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ mode, toggleTheme }) => {
  const theme = useTheme();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const links = [
    { title: "ดูเหตุการณ์", href: "/event" },
    { title: "สถิติและประวัติเหตุการณ์", href: "/history" },
    { title: "สมัครรับแจ้งเตือน", href: "/subscribe" },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ backdropFilter: "blur(8px)", bgcolor: theme.palette.background.paper, borderBottom: "1px solid", borderColor: theme.palette.divider }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography component={Link} to="/" variant="h6" sx={{ textDecoration: "none", fontWeight: 700, color: theme.palette.text.primary }}>
          Hyperlocal Community Alert
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
          {links.map((link) => (
            <Button key={link.href} component={Link} to={link.href} sx={{ color: theme.palette.text.primary, "&:hover": { bgcolor: theme.palette.action.hover } }}>
              {link.title}
            </Button>
          ))}
          
          <Tooltip title="สำหรับเจ้าหน้าที่">
            <IconButton component={Link} to="/admin/dashboard" sx={{ color: theme.palette.primary.main }}>
              <AdminPanelSettingsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="เปลี่ยนธีม">
            <IconButton onClick={toggleTheme} sx={{ color: theme.palette.text.primary }}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton onClick={(e) => setAnchorElNav(e.currentTarget)} sx={{ color: theme.palette.text.primary }}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={() => setAnchorElNav(null)} PaperProps={{ sx: { width: 200, borderRadius: 3, mt: 1.5 } }}>
            {links.map((link) => (
              <MenuItem key={link.href} component={Link} to={link.href} onClick={() => setAnchorElNav(null)}>
                {link.title}
              </MenuItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <MenuItem component={Link} to="/admin/dashboard" onClick={() => setAnchorElNav(null)} sx={{ color: "primary.main" }}>
              <AdminPanelSettingsIcon sx={{ mr: 1.5, fontSize: 20 }} /> เจ้าหน้าที่
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={() => { toggleTheme(); setAnchorElNav(null); }}>
              {mode === "dark" ? "โหมดสว่าง ☀️" : "โหมดมืด 🌙"}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;