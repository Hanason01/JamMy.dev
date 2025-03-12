"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";

interface CustomVerticalSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  color?: string;
  unit?: string;
  disabled?: boolean;
}

export function CustomVerticalSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  color = "#3F51B5",
  unit = "%",
  disabled = false,
}: CustomVerticalSliderProps) {
  const [internalValue, setInternalValue] = useState(value);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handlePointerMove = (event: PointerEvent) => {
    if (!trackRef.current || disabled) return;

    const rect = trackRef.current.getBoundingClientRect();
    let newValue = max - ((event.clientY - rect.top) / rect.height) * (max - min);

    newValue = Math.max(min, Math.min(max, Math.round(newValue)));

    setInternalValue(newValue);
    onChange(newValue);
  };


  const handlePointerDown = () => {
    if (disabled) return;
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
        flexDirection: "column",
        alignItems: "center",
        height: "150px",
        width: "60px",
        opacity: disabled ? 0.5 : 1,
        touchAction: "none",
      }}
    >
      <Box
        ref={trackRef}
        sx={{
          position: "relative",
          width: "6px",
          height: "86px",
          background: disabled ? "#CCC" : "#DDD",
          borderRadius: "4px",
          cursor: disabled ? "not-allowed" : "pointer",
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: `${((internalValue - min) / (max - min)) * 100}%`,
            bottom: 0,
            background: disabled ? "#AAA" : "#FFC107",
            borderRadius: "4px",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: `${((internalValue - min) / (max - min)) * 100}%`,
            transform: "translate(-50%, 50%)",
            width: "20px",
            height: "20px",
            background: disabled ? "#888" : "#FFC107",
            borderRadius: "50%",
            cursor: disabled ? "not-allowed" : "pointer",
            left: "50%",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
          }}
          onPointerDown={handlePointerDown}
        />
      </Box>

      <Typography
        sx={{
          mt: 1,
          fontSize: "0.875rem",
          fontWeight: "bold",
          width: "50px",
          textAlign: "center",
        }}
      >
        {Math.round(internalValue)}{unit}
      </Typography>
    </Box>
  );
}
