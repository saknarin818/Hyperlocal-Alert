import React from "react";
import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
  alpha,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";

/* ================================
   Time range config
================================ */
export type TimeRangeOption = {
  label: string;
  days: number;
};

export const TIME_RANGES: TimeRangeOption[] = [
  { label: "วันนี้", days: 1 },
  { label: "3 วัน", days: 3 },
  { label: "5 วัน", days: 5 },
  { label: "7 วัน", days: 7 },
  { label: "30 วัน", days: 30 },
  { label: "60 วัน", days: 60 },
  { label: "90 วัน", days: 90 },
  { label: "1 ปี", days: 365 },
];

/* ================================
   Props
================================ */
type TimeFilterProps = {
  days: number;
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(
            180deg,
            ${alpha(theme.palette.background.paper, 0.9)},
            ${alpha(theme.palette.background.paper, 0.6)}
          )`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          gap={2}
        >
          {/* Left label */}
          <Stack direction="row" alignItems="center" gap={1}>
            <DateRangeIcon
              fontSize="small"
              sx={{ color: theme.palette.primary.main }}
            />
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="text.primary"
            >
              {label}
            </Typography>
          </Stack>

          {/* Toggle */}
          <ToggleButtonGroup
  value={days}
  exclusive
  onChange={(_, val) => val && onChange(val)}
  size="small"
  sx={{
    width: "100%",

    /* Mobile scroll */
    overflowX: { xs: "auto", md: "visible" },
    flexWrap: { xs: "nowrap", md: "wrap" },
    whiteSpace: "nowrap",

    /* remove scrollbar */
    "&::-webkit-scrollbar": { display: "none" },

    backgroundColor: alpha(theme.palette.background.default, 0.6),
    borderRadius: 2,
    p: 0.5,
    gap: 0.5,

    "& .MuiToggleButton-root": {
      flexShrink: 0, // ❗ ป้องกันปุ่มหดในมือถือ
      borderRadius: 2,
      border: "none",
      px: { xs: 1.25, md: 1.5 },
      py: { xs: 0.6, md: 0.75 },
      fontSize: { xs: 12, md: 13 },
      fontWeight: 600,
      color: theme.palette.text.secondary,
      transition: "all 0.25s ease",

      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
      },

      "&.Mui-selected": {
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
        boxShadow: `0 4px 12px ${alpha(
          theme.palette.primary.main,
          0.35
        )}`,
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
        },
      },
    },
  }}
>
  {TIME_RANGES.map((t) => (
    <ToggleButton key={t.days} value={t.days}>
      {t.days === 1 && <TodayIcon sx={{ fontSize: 16, mr: 0.5 }} />}
      {t.label}
    </ToggleButton>
  ))}
</ToggleButtonGroup>

        </Stack>
      </Paper>
    </motion.div>
  );
}
