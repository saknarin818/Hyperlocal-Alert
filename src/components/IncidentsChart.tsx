import React from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  useTheme,
} from "@mui/material";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Timestamp } from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

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

type ChartType = "bar" | "doughnut";

type IncidentsChartProps = {
  incidents: Incident[];
  loading: boolean;
};

/* ================= PROCESS DATA ================= */
const processDataForCharts = (incidents: Incident[]) => {
  const counts: Record<string, number> = {};
  incidents.forEach((i) => {
    const label = typeLabelTH[i.type] || i.type;
    counts[label] = (counts[label] || 0) + 1;
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const colors = [
    "#ff6384",
    "#36a2eb",
    "#ffce56",
    "#4bc0c0",
    "#9966ff",
    "#ff9f40",
    "#8bc34a",
    "#00bcd4",
    "#e91e63",
    "#607d8b",
  ];

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: "จำนวนเหตุการณ์",
        data: Object.values(counts),
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 8,
        hoverOffset: 6,
      },
    ],
    total,
  };
};

export default function IncidentsChart({
  incidents,
  loading,
}: IncidentsChartProps) {
  const theme = useTheme();
  const [chartType, setChartType] = React.useState<ChartType>("bar");

  const { labels, datasets, total } = processDataForCharts(incidents);

  const chartData = { labels, datasets };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: theme.palette.text.primary },
        position: "bottom",
      },
      title: {
        display: true,
        text: "สรุปจำนวนเหตุการณ์ตามประเภท",
        color: theme.palette.text.primary,
        font: { size: 18 },
      },
      datalabels:
        chartType === "doughnut"
          ? {
              color: "#fff",
              font: { weight: "bold", size: 14 },
              formatter: (value: number) => {
                const percent = ((value / total) * 100).toFixed(0);
                return percent + "%";
              },
            }
          : false,
    },
    cutout: chartType === "doughnut" ? "65%" : undefined,
    scales:
      chartType === "bar"
        ? {
            x: { ticks: { color: theme.palette.text.secondary } },
            y: { ticks: { color: theme.palette.text.secondary } },
          }
        : {},
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        mb: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h6" fontWeight={700}>
          📊 สรุปสถิติ
        </Typography>

        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(_, val) => val && setChartType(val)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              border: "none",
              px: 2,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "transparent",
              color: "text.secondary",
              transition: "all .2s ease",

              "&:hover": {
                backgroundColor: "transparent",
                opacity: 0.8,
              },

              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "#fff",
              },

              "&.Mui-selected:hover": {
                backgroundColor: "primary.dark",
              },
            },
          }}
        >
          <ToggleButton value="bar">แท่ง</ToggleButton>
          <ToggleButton value="doughnut">โดนัท</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {loading ? (
        <Typography color="text.secondary">กำลังโหลดข้อมูล...</Typography>
      ) : incidents.length === 0 ? (
        <Typography color="text.secondary">
          ไม่มีข้อมูลในช่วงเวลาที่เลือก
        </Typography>
      ) : (
        <Box sx={{ height: 420 }}>
          {chartType === "bar" && (
            <Bar data={chartData} options={chartOptions} />
          )}
          {chartType === "doughnut" && (
            <Doughnut data={chartData} options={chartOptions} />
          )}
        </Box>
      )}
    </Paper>
  );
}
