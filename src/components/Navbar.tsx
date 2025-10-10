import React from "react";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
} from "@mui/material";

const Navbar: React.FC = () => {
  const links = [
    // { title: "แนะนำระบบ", href: "/about" }, 
=======
import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";

const Navbar: React.FC = () => {
  const links = [
>>>>>>> upstream/main
    { title: "ดูเหตุการณ์", href: "/events" },
    { title: "เช็คประวัติเหตุการณ์", href: "/ddd" },
    { title: "สมัครรับแจ้งเตือน", href: "/subscribe" },
  ];

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
<<<<<<< HEAD

        <Stack
          direction="row"
          spacing={2}
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {links.map((link) => (
            <Button key={link.title} component={Link} to={link.href}>
=======
        <Stack direction="row" spacing={2} sx={{ display: { xs: "none", md: "flex" } }}>
          {links.map((link) => (
            <Button key={link.href} component={Link} to={link.href}>
>>>>>>> upstream/main
              {link.title}
            </Button>
          ))}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
