import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const [openAbout, setOpenAbout] = useState(false);

  const links = [
    { title: "แนะนำระบบ", action: () => setOpenAbout(true) }, // ✅ เปิด modal
    { title: "ดูเหตุการณ์", href: "/events" },
    { title: "เช็คประวัติเหตุการณ์", href: "/report" },
    { title: "สมัครรับแจ้งเตือน", href: "/subscribe" },
  ];

  return (
    <>
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
            {links.map((link) =>
              link.href ? (
                <Button key={link.href} component={Link} to={link.href}>
                  {link.title}
                </Button>
              ) : (
                <Button key={link.title} onClick={link.action}>
                  {link.title}
                </Button>
              )
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ✅ Dialog About with framer-motion */}
      <AnimatePresence>
        {openAbout && (
          <Dialog
            open={openAbout}
            onClose={() => setOpenAbout(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
            >
              <DialogTitle>
                เกี่ยวกับระบบ
                <IconButton
                  aria-label="close"
                  onClick={() => setOpenAbout(false)}
                  sx={{ position: "absolute", right: 8, top: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <Typography gutterBottom>
                  ระบบแจ้งเหตุชุมชน (Community Alert System) ถูกออกแบบมาเพื่อช่วยให้ประชาชน
                  สามารถรายงานเหตุการณ์ต่าง ๆ ได้อย่างสะดวกและรวดเร็ว
                </Typography>
                <Typography gutterBottom>
                  ระบบนี้ยังช่วยให้ทุกคนสามารถติดตามสถานการณ์ล่าสุดในชุมชน
                  และรับการแจ้งเตือนผ่านช่องทางที่สะดวก เช่น อีเมล หรือไลน์
                  เพื่อเพิ่มความปลอดภัยและความอุ่นใจในชีวิตประจำวัน
                </Typography>
              </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;