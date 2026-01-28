import React from "react";
import {
  Paper,
  Typography,
  Stack,
  Box,
  Divider,
} from "@mui/material";
import { Timestamp } from "firebase/firestore";

/* ================= TYPES ================= */
interface Incident {
  id: string;
  type: string;
  description: string;
  location?: string;
  contact?: string;
  status: "กำลังตรวจสอบ" | "เสร็จสิ้น";
  createdAt: Timestamp;
}

const typeLabelTH: Record<string, string> = {
  fire: "ไฟไหม้",
  accident: "อุบัติเหตุ",
  crime: "อาชญากรรม",
  medical: "เหตุฉุกเฉินทางการแพทย์",
  disaster: "ภัยพิบัติ",
  utility: "สาธารณูปโภค",
  flood: "น้ำท่วม",
  electricity: "ไฟฟ้าขัดข้อง",
  water: "น้ำประปาขัดข้อง",
  general: "เหตุทั่วไป",
  other: "เหตุการณ์อื่น ๆ",
};

/* ================= DATE FORMAT ================= */
const formatDate = (timestamp: Timestamp) => {
  return timestamp.toDate().toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

type IncidentsListProps = {
  incidents: Incident[];
};

export default function IncidentsList({ incidents }: IncidentsListProps) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        รายการเหตุการณ์ย้อนหลัง
      </Typography>

      {incidents.length === 0 ? (
        <Typography color="text.secondary">ไม่มีเหตุการณ์ในช่วงเวลาที่เลือก</Typography>
      ) : (
        <Stack spacing={2}>
          {[...incidents]
            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
            .map((incident) => (
              <Box key={incident.id}>
                <Typography fontWeight={600}>
                  {typeLabelTH[incident.type] || incident.type}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  แจ้งเมื่อ: {formatDate(incident.createdAt)}
                </Typography>
                {incident.description && (
                  <Typography variant="body2" mb={0.5}>
                    <strong>รายละเอียด:</strong> {incident.description}
                  </Typography>
                )}
                {incident.location && (
                  <Typography variant="body2" mb={0.5}>
                    <strong>สถานที่:</strong> {incident.location}
                  </Typography>
                )}
                {incident.contact && (
                  <Typography variant="body2" mb={0.5}>
                    <strong>ข้อมูลติดต่อ:</strong> {incident.contact}
                  </Typography>
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
        </Stack>
      )}
    </Paper>
  );
}
