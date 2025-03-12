"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";

interface CustomSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  color?: string;
  unit?: string;
}

export function CustomSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  color = "#3F51B5",
  unit = "",
}: CustomSliderProps) {
  const [internalValue, setInternalValue] = useState(value);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handlePointerMove = (event: PointerEvent) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const newValue = Math.round(
      ((event.clientX - rect.left) / rect.width) * (max - min) + min
    );

    if (newValue >= min && newValue <= max) {
      setInternalValue(newValue);
      onChange(newValue);
    }
  };

  const handlePointerDown = () => {
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerUp = () => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        my: 1,
        width: "100%",
      }}
    >
      <Box sx={{ flexGrow: 1, mr: 2 }}>
        <Box
          ref={trackRef}
          sx={{
            position: "relative",
            width: "100%",
            height: "5px",
            background: "#DDD",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onPointerDown={handlePointerDown}
        >
          {/* スライダーの進捗部分 */}
          <Box
            sx={{
              position: "absolute",
              height: "6px",
              width: `${((internalValue - min) / (max - min)) * 100}%`,
              background: color,
              borderRadius: "4px",
            }}
          />

          {/* スライダーのハンドル部分 */}
          <Box
            sx={{
              position: "absolute",
              left: `${((internalValue - min) / (max - min)) * 100}%`,
              transform: "translate(-50%, -50%)",
              width: "24px",
              height: "24px",
              background: color,
              borderRadius: "50%",
              cursor: "pointer",
              top: "50%",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            }}
            onPointerDown={handlePointerDown}
          />
        </Box>
      </Box>
      <Typography
        align="left"
        sx={{
          width: "70px",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      >
        {internalValue} {unit}
      </Typography>
    </Box>
  );
}
