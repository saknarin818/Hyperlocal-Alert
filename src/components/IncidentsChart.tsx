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
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { Timestamp } from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend
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

type ChartType = "bar" | "line" | "pie";

type IncidentsChartProps = {
  incidents: Incident[];
  loading: boolean;
};

/* ================= PROCESS DATA FOR CHARTS ================= */
const processDataForCharts = (incidents: Incident[]) => {
  const counts: Record<string, number> = {};
  incidents.forEach((i) => {
    const label = typeLabelTH[i.type] || i.type;
    counts[label] = (counts[label] || 0) + 1;
  });

  const colors = [
    "rgba(255,99,132,0.6)",
    "rgba(54,162,235,0.6)",
    "rgba(255,206,86,0.6)",
    "rgba(75,192,192,0.6)",
    "rgba(153,102,255,0.6)",
    "rgba(255,159,64,0.6)",
    "rgba(199,199,199,0.6)",
    "rgba(83,102,255,0.6)",
    "rgba(255,99,255,0.6)",
    "rgba(99,255,132,0.6)",
  ];

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: "จำนวนเหตุการณ์",
        data: Object.values(counts),
        backgroundColor: colors.slice(0, Object.keys(counts).length),
        borderColor: colors.slice(0, Object.keys(counts).length).map((c) =>
          c.replace("0.6", "1")
        ),
        borderWidth: 2,
        borderRadius: 6,
        tension: 0.4,
      },
    ],
  };
};

export default function IncidentsChart({
  incidents,
  loading,
}: IncidentsChartProps) {
  const theme = useTheme();
  const [chartType, setChartType] = React.useState<ChartType>("bar");

  const chartData = processDataForCharts(incidents);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: theme.palette.text.primary } },
      title: {
        display: true,
        text: "สรุปจำนวนเหตุการณ์ตามประเภท",
        color: theme.palette.text.primary,
        font: { size: 18 },
      },
    },
    scales:
      chartType !== "pie"
        ? {
            x: { ticks: { color: theme.palette.text.secondary } },
            y: { ticks: { color: theme.palette.text.secondary } },
          }
        : {},
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={700}>
          สรุปสถิติ
        </Typography>

        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(_, val) => val && setChartType(val)}
          size="small"
        >
          <ToggleButton value="bar">📊 แท่ง</ToggleButton>
          <ToggleButton value="line">📈 เส้น</ToggleButton>
          <ToggleButton value="pie">🥧 วงกลม</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {loading ? (
        <Typography color="text.secondary">กำลังโหลดข้อมูล...</Typography>
      ) : incidents.length === 0 ? (
        <Typography color="text.secondary">ไม่มีข้อมูลในช่วงเวลาที่เลือก</Typography>
      ) : (
        <Box sx={{ height: 420 }}>
          {chartType === "bar" && (
            <Bar data={chartData} options={chartOptions} />
          )}
          {chartType === "line" && (
            <Line data={chartData} options={chartOptions} />
          )}
          {chartType === "pie" && (
            <Pie data={chartData} options={chartOptions} />
          )}
        </Box>
      )}
    </Paper>
  );
}
