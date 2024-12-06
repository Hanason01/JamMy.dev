import { useRef, useEffect } from "react";
import { useTheme } from "@mui/material/styles";

export function AnalyzerVisualization({ analyzerData }) {
  const theme = useTheme(); //Dom要素に直接スタイルする為
  const canvasRef = useRef(null); //return中のrefにより初回レンダリング時に<canvas>要素がセットされる(DOM参照)

  //analyzerData（マイク入力ソース）の変化により以下が呼び出し
  useEffect(() => {
    // console.log("AnalyzerVisualization Rendered", { analyzerData }); // デバッグ: データの更新時
    if (!canvasRef.current || !analyzerData.length) {
      console.log("キャンバスが存在しない、または analyzerData が空です");
      return;
    }

    //canvasの設定
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d"); //2D描画コンテキストをcanvasから取り出し
    const width = canvas.width; //DOM/canvasの幅取得
    const height = canvas.height; //DOM/canvasの高さ取得

    // console.log("キャンバスの描画を開始", { width, height }); // デバッグ: キャンバスサイズ

    const draw = () => {
      ctx.clearRect(0, 0, width, height); // Canvas全体をクリア
      // console.log("キャンバスをクリアしました");

      ctx.fillStyle = theme.palette.background.default;;
      ctx.fillRect(0, 0, width, height);

      const barWidth = width / analyzerData.length; //バー幅の計算
      // console.log("バーの幅を計算", { barWidth, dataLength: analyzerData.length });

      analyzerData.forEach((value, index) => {
        const barHeight = (value / 255) * height; // データをスケール変換
        const x = index * barWidth;

        // console.log(`バー描画: index=${index}, value=${value}, barHeight=${barHeight}`);

        ctx.fillStyle = theme.palette.secondary.main;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      });
    };

    draw();
  }, [analyzerData]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={150}
      style={{
        width: "100%",
        maxWidth: "400px",
        height: "150px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    />
  );
}
