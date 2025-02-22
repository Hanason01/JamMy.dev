"use client";

import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

type PullToRefreshProps = {
  onRefresh: () => Promise<void>;
};

export const PullToRefresh = ({ onRefresh }: PullToRefreshProps) => {
  const [startY, setStartY] = useState<number | null>(null);
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (window.scrollY === 0) {
        setStartY(event.touches[0].clientY);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (startY === null || window.scrollY !== 0) return;

      const distance = event.touches[0].clientY - startY;
      if (distance > 0) {
        event.preventDefault(); // ネイティブリフレッシュ防止
        setPullProgress(Math.min(distance, 50)); // 最大50pxまで制限
      }
    };

    const handleTouchEnd = async () => {
      if (pullProgress >= 50 && !isRefreshing) { // 50px 以上引っ張ったらリフレッシュ発動
        setIsRefreshing(true);
        setPullProgress(50);

        await onRefresh(); // データ再取得

        setIsRefreshing(false);
        setPullProgress(0);
      } else {
        setPullProgress(0); // 未達ならリセット
      }
      setStartY(null);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [startY, isRefreshing, pullProgress, onRefresh]);

  return (
    <Box sx={{
      position: "relative",
      height: pullProgress,
      textAlign: "center",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {pullProgress > 0 && (
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "translateY(5px)",
          opacity: pullProgress / 50,
        }}>
          <ArrowDownwardIcon sx={{ fontSize: 24 }} />
        </Box>
      )}
    </Box>
  );
};
