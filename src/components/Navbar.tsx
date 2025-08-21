import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";

const Navbar: React.FC = () => {
  const links = [
    { title: "แนะนำระบบ", href: "/about" },
    { title: "แจ้งเหตุ", href: "/report" },
    { title: "ดูเหตุการณ์", href: "/events" },
    { title: "สมัครรับแจ้งเตือน", href: "/subscribe" },
  ];

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" color="primary">
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
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
