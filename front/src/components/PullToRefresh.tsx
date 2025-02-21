"use client";

import { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";

type PullToRefreshProps = {
  onRefresh: () => Promise<void>;
};

export const PullToRefresh = ({ onRefresh }: PullToRefreshProps) => {
  const [startY, setStartY] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (window.scrollY === 0) {
        setStartY(event.touches[0].clientY);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (startY !== null && window.scrollY === 0 && event.touches[0].clientY - startY > 50) {
        event.preventDefault(); // デフォルトのリフレッシュを無効化
      }
    };

    const handleTouchEnd = async (event: TouchEvent) => {
      if (startY !== null) {
        const distance = event.changedTouches[0].clientY - startY;

        if (distance > 100 && !isRefreshing) {
          setIsRefreshing(true);

          try {
            await onRefresh();
          } catch (error) {
            console.error("再取得に失敗しました:", error);
          } finally {
            setIsRefreshing(false);
          }
        }
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
  }, [startY, isRefreshing, onRefresh]);

  return (
    <Box sx={{ position: "relative", height: isRefreshing ? 64 : 0, textAlign: "center" }}>
      {isRefreshing && <CircularProgress />}
    </Box>
  );
};
