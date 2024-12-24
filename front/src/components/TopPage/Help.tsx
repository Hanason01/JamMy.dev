"use client";

import { Typography, Box } from "@mui/material";

export function Help(){
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        gap: 2,
      }}
      >
        <Typography variant="h4">~使い方~</Typography>
        <Typography variant="h6">スマホモックで使い方説明</Typography>
      </Box>
  );
}