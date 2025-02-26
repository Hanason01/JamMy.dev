import { useRef, useEffect } from "react";
import { useTheme } from "@mui/material/styles";

// Props の型定義
interface AnalyzerVisualizationProps {
  analyzerData: Uint8Array;
}

export function AnalyzerVisualization({ analyzerData }: AnalyzerVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const volumeHistory = useRef<number[]>([]); // 過去の音量データを保持
  const theme = useTheme(); // MUIテーマを使用して色を指定

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = 8; // 各バーの幅
    const barSpacing = 2; // 各バー間のスペース
    const totalBarWidth = barWidth + barSpacing; // 各バー + スペースの合計幅
    const maxBars = Math.floor(width / totalBarWidth); // 描画可能なバーの数

    // 音量データの計算
    const calculateVolume = () => {
      if (analyzerData.length === 0) return 0;
      const avg = analyzerData.reduce((acc, val) => acc + val, 0) / analyzerData.length;
      return (avg / 255) * 100; // 0〜100にスケール
    };

    // 過去の音量データを更新
    const volume = calculateVolume();
    volumeHistory.current.push(volume);
    if (volumeHistory.current.length > maxBars) {
      volumeHistory.current.shift(); // 古いデータを削除
    }

    // 描画処理
    ctx.clearRect(0, 0, width, height); // キャンバスをクリア
    volumeHistory.current.forEach((vol, index) => {
      const barHeight = (vol / 100) * height; // 音量を高さにスケーリング
      const x = index * totalBarWidth; // 左から右に描画位置を計算

      ctx.fillStyle = theme.palette.secondary.main; // バーの色
      ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight); // 上下対称に配置
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
