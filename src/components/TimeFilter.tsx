import React from "react";
import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";

/* ================================
   Time range config (ใช้จริง)
================================ */
export type TimeRangeOption = {
  label: string;
  days: number;
};

export const TIME_RANGES: TimeRangeOption[] = [
  { label: "วันนี้", days: 1 },
  { label: "3 วันล่าสุด", days: 3 },
  { label: "5 วันล่าสุด", days: 5 },
  { label: "7 วันล่าสุด", days: 7 },
  { label: "30 วันล่าสุด", days: 30 },
  { label: "60 วันล่าสุด", days: 60 },
  { label: "90 วันล่าสุด", days: 90 },
  { label: "1 ปีล่าสุด", days: 365 },
];

/* ================================
   Props
================================ */
type TimeFilterProps = {
  days: number;                 // ใช้ filter จริง
  onChange: (days: number) => void;
  label?: string;
};

/* ================================
   Component
================================ */
export default function TimeFilter({
  days,
  onChange,
  label = "ช่วงเวลา",
}: TimeFilterProps) {
  const theme = useTheme();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="flex-end"
        alignItems="center"
        gap={2}
        mb={4}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          color="text.secondary"
          sx={{ minWidth: "60px" }}
        >
          {label}
        </Typography>

        <ToggleButtonGroup
          value={days}
          exclusive
          onChange={(_, val) => val && onChange(val)}
          size="small"
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 0.5,
            "& .MuiToggleButton-root": {
              borderRadius: 1.5,
              border: "none",
              color: theme.palette.text.secondary,
              fontWeight: 600,
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
              },
              "&.Mui-selected": {
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
            },
          }}
        >
          {TIME_RANGES.map((t) => (
            <ToggleButton key={t.days} value={t.days} aria-label={t.label}>
              {t.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
    </motion.div>
  );
}
