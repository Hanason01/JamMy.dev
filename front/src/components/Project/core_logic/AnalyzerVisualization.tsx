import { useRef, useEffect } from "react";
import { useTheme } from "@mui/material/styles";

interface AnalyzerVisualizationProps {
  analyzerData: Uint8Array;
}

export function AnalyzerVisualization({ analyzerData }: AnalyzerVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const volumeHistory = useRef<number[]>([]);
  const theme = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = 8;
    const barSpacing = 2;
    const totalBarWidth = barWidth + barSpacing;
    const maxBars = Math.floor(width / totalBarWidth);

    // 音量データの計算
    const calculateVolume = () => {
      if (analyzerData.length === 0) return 0;
      const avg = analyzerData.reduce((acc, val) => acc + val, 0) / analyzerData.length;
      return (avg / 255) * 100;
    };

    // 過去の音量データを更新
    const volume = calculateVolume();
    volumeHistory.current.push(volume);
    if (volumeHistory.current.length > maxBars) {
      volumeHistory.current.shift();
    }

    // 描画処理
    ctx.clearRect(0, 0, width, height);
    volumeHistory.current.forEach((vol, index) => {
      const barHeight = (vol / 100) * height;
      const x = index * totalBarWidth;

      ctx.fillStyle = theme.palette.secondary.main;
      ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
    });
  }, [analyzerData]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={150}
      style={{
        width: "90%",
        maxWidth: "400px",
        height: "100px",
      }}
    />
  );
}
