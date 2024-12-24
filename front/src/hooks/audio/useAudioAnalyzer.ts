import { useRef, useState } from "react";

export function useAudioAnalyzer() {
  const [analyzerData, setAnalyzerData] = useState<Uint8Array>(new Uint8Array(0)); // アナライザーのデータ
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const intervalIdRef = useRef<number | null>(null); // データ取得用のタイマーID

// アナライザーの初期化
  const initializeAnalyzer = (audioContext: AudioContext | null, mediaStreamSource: MediaStreamAudioSourceNode | null): AnalyserNode | null => {
    if (!audioContext || !mediaStreamSource) {
    console.error("AudioContext または MediaStreamSource が提供されていません");
    return null;
    }

    //セーフガード
    if (analyserNodeRef.current) {
      cleanupAnalyzer(mediaStreamSource);
    }

    // AnalyserNodeを作成
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // 分解能の設定
    analyserNodeRef.current = analyser;

    // MediaStreamSourceをAnalyserNodeに接続
    mediaStreamSource.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;

    // 定期的にデータを取得するタイマーを設定
    intervalIdRef.current = window.setInterval(() => {
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray); // 振幅データを取得
      setAnalyzerData(dataArray); // 状態を更新
    }, 50);

    return analyser;
  };

  // アナライザーのクリーンアップ
  const cleanupAnalyzer = (mediaStreamSource: MediaStreamAudioSourceNode | null): void => {
    // インターバルのクリーンアップ
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    //MediaStreamSource と AnalyserNode の接続を解除
    if (mediaStreamSource && analyserNodeRef.current) {
      console.log("アナライザーのクリーンアップ時点のmediaStreamとanalyzerNode",mediaStreamSource,analyserNodeRef.current);
      mediaStreamSource.disconnect(analyserNodeRef.current);
      analyserNodeRef.current.disconnect();
      analyserNodeRef.current = null;
    }
    setAnalyzerData(new Uint8Array(0)); // データをリセット
  };

  return { analyzerData, initializeAnalyzer, cleanupAnalyzer };
}
