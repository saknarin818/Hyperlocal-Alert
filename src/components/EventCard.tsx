import React from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";

// Icons
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

/* -------------------- TYPE -------------------- */
type Incident = {
  id: string;
  type: string;
  description: string;
  location?: string;
  contact?: string;
  imageUrl?: string;
  createdAt?: any;
  coordinates?: {
    lat: number;
    lng: number;
  };
};

type EventCardProps = {
  incident: Incident;
  typeLabel: string;
  index: number;
  onMapClick: (coordinates: { lat: number; lng: number }) => void;
  onDetailClick: (incident: Incident) => void;
};

/* -------------------- COMPONENT -------------------- */
export default function EventCard({
  incident,
  typeLabel,
  index,
  onMapClick,
  onDetailClick,
}: EventCardProps) {
  const hasCoords = incident.coordinates?.lat && incident.coordinates?.lng;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Paper
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: 2,
          },
        }}
        onClick={() => onDetailClick(incident)}
      >
        <Box p={3}>
          <Typography variant="h6" fontWeight={800}>
            {typeLabel}
          </Typography>

          <Typography mt={1} mb={2}>
            {incident.description}
          </Typography>

          {/* Image */}
          {incident.imageUrl && (
            <Box
              component="img"
              src={incident.imageUrl}
              alt="incident"
              sx={{
                width: "100%",
                maxHeight: 260,
                objectFit: "cover",
                borderRadius: 2,
                mb: 2,
              }}
            />
          )}

          {hasCoords && (
            <Button
              size="small"
              variant="outlined"
              sx={{ mb: 2, borderRadius: "999px" }}
              onClick={() => onMapClick(incident.coordinates!)}
            >
              🗺️ ดูแผนที่
            </Button>
          )}

          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <LocationOnRoundedIcon fontSize="small" />
              <Typography variant="body2">
                {incident.location || "-"}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <PhoneRoundedIcon fontSize="small" />
              <Typography variant="body2">
                {incident.contact || "-"}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <AccessTimeRoundedIcon fontSize="small" />
              <Typography variant="caption">
                {incident.createdAt?.toDate
                  ? incident.createdAt
                      .toDate()
                      .toLocaleString("th-TH")
                  : "-"}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </motion.div>
  );
}
