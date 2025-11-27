import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Navbar: React.FC = () => {
  const links = [
    { title: "ดูเหตุการณ์", href: "/event" },
    { title: "เช็คประวัติเหตุการณ์", href: "/history" },
    { title: "สมัครรับแจ้งเตือน", href: "/subscribe" },
  ];

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          color="primary"
          component={Link}
          to="/"
          sx={{ textDecoration: "none", cursor: "pointer" }}
        >
          Community Alert
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {links.map((link) => (
            <Button key={link.href} component={Link} to={link.href}>
              {link.title}
            </Button>
          ))}
        </Stack>

        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: "block", md: "none" },
            }}
          >
            {links.map((link) => (
              <MenuItem
                key={link.href}
                onClick={handleCloseNavMenu}
                component={Link}
                to={link.href}
              >
                <Typography textAlign="center">{link.title}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
