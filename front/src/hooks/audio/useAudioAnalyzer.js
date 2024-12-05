import { useRef, useState } from "react";

export function useAudioAnalyzer() {
  const [analyzerData, setAnalyzerData] = useState(new Uint8Array(0)); // アナライザーのデータ
  const analyserNodeRef = useRef(null);
  const intervalIdRef = useRef(null); // データ取得用のタイマーID

  // アナライザーの初期化
  const initializeAnalyzer = (audioContext, mediaStreamSource) => {
    if (!audioContext || !mediaStreamSource) {
      console.error("AudioContext または MediaStreamSource が提供されていません");
      return;
    }

    // AnalyserNodeを作成
    const analyser = audioContext.createAnalyser();
    // AnalyserNodeのプロパティを設定
    analyser.fftSize = 256; // 分解能の設定（例: 256点）
    analyser.smoothingTimeConstant = 0.8; // 過去のデータの影響を調整
    analyser.minDecibels = -90; // デシベル範囲を設定
    analyser.maxDecibels = -10;

    console.log("AnalyserNode 作成", analyser);

    // MediaStreamSourceをAnalyserNodeに接続
    mediaStreamSource.connect(analyser);
    analyserNodeRef.current = analyser;
    console.log("MediaStreamSource を AnalyserNode に接続しました");

    //周波数データの取得
    const bufferLength = analyser.frequencyBinCount;

   // 定期的にデータを取得するタイマーを設定
    intervalIdRef.current = setInterval(() => {
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
      setAnalyzerData(dataArray);
    }, 50);

  return analyser;
};
      // アナライザーのクリーンアップ
  const cleanupAnalyzer = (mediaStreamSource) => {
    console.log("useAudioAnalyzer: クリーンアップ開始");
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);// タイマーをクリア
      intervalIdRef.current = null;
    }

    if (mediaStreamSource && analyserNodeRef.current) {
      mediaStreamSource.disconnect(analyserNodeRef.current);// AnalyserNodeとの接続を切断
      analyserNodeRef.current.disconnect();// 他の接続も切断
      analyserNodeRef.current = null;
    }
    setAnalyzerData(new Uint8Array(0));
    console.log("useAudioAnalyzer: クリーンアップ完了");
  };

  return { analyzerData, initializeAnalyzer, cleanupAnalyzer };
}
