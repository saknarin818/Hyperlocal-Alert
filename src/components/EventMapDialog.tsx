import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Leaflet
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type EventMapDialogProps = {
  open: boolean;
  coordinates: { lat: number; lng: number } | null;
  onClose: () => void;
};

export default function EventMapDialog({
  open,
  coordinates,
  onClose,
}: EventMapDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        ตำแหน่งเหตุการณ์
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {coordinates && (
          <Box sx={{ height: 420, borderRadius: 2, overflow: "hidden" }}>
            <MapContainer
              center={[coordinates.lat, coordinates.lng]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[coordinates.lat, coordinates.lng]}
              />
            </MapContainer>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
