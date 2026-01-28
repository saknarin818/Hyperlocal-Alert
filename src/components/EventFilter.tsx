import React from "react";
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

type EventFilterProps = {
  searchText: string;
  selectedType: string;
  categories: string[];
  onSearchChange: (text: string) => void;
  onTypeChange: (type: string) => void;
  getTypeLabel: (type: string) => string;
};

export default function EventFilter({
  searchText,
  selectedType,
  categories,
  onSearchChange,
  onTypeChange,
  getTypeLabel,
}: EventFilterProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      mb={4}
    >
      <TextField
        fullWidth
        size="small"
        label="ค้นหาเหตุการณ์"
        placeholder="ประเภท / รายละเอียด / สถานที่"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel>หมวดเหตุการณ์</InputLabel>
        <Select
          label="หมวดเหตุการณ์"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <MenuItem value="all">ทั้งหมด</MenuItem>
          {categories.map((type) => (
            <MenuItem key={type} value={type}>
              {getTypeLabel(type)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
