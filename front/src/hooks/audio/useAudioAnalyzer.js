import { useEffect, useRef, useState } from "react";

export function useAudioAnalyzer(audioContext, mediaStreamSource) {
  const [analyzerData, setAnalyzerData] = useState(new Uint8Array(0)); // アナライザーのデータ
  const analyserNodeRef = useRef(null);

  useEffect(() => {
    console.log("useAudioAnalyzer: Effect開始", { audioContext, mediaStreamSource });

    if (audioContext && mediaStreamSource) {
      // AnalyserNodeを作成
      analyserNodeRef.current = audioContext.createAnalyser();
      const analyser = analyserNodeRef.current;
      // AnalyserNodeのプロパティを設定
      analyser.fftSize = 256; // 分解能の設定（例: 256点）
      analyser.smoothingTimeConstant = 0.8; // 過去のデータの影響を調整
      analyser.minDecibels = -90; // デシベル範囲を設定
      analyser.maxDecibels = -10;

      console.log("AnalyserNode 作成", analyser);

      //周波数データの取得
      const bufferLength = analyser.frequencyBinCount;

      // MediaStreamSourceをAnalyserNodeに接続
      mediaStreamSource.connect(analyser);
      console.log("MediaStreamSource を AnalyserNode に接続しました");

      // 定期的にデータを取得する
      const intervalId = setInterval(() => {
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        console.log("取得したデータ", [...dataArray]); // デバッグ: データの中身
        setAnalyzerData(dataArray); // 新しいデータを更新
      }, 50); // 50msごとに更新

      return () => {
        console.log("useAudioAnalyzer: クリーンアップ開始");
        clearInterval(intervalId); // タイマーをクリア
        mediaStreamSource.disconnect(analyser); // AnalyserNodeとの接続を切断
        analyser.disconnect(); // 他の接続も切断
        setAnalyzerData(new Uint8Array(0));
        console.log("useAudioAnalyzer: クリーンアップ完了");
      };
    } else {
      console.log("audioContext または mediaStreamSource がありません");
    }
  }, [audioContext, mediaStreamSource]);
  //録音ボタンによりaudioContextが初期化されている。マイクが選択され、マイク入力が行われている（mediaStreamSourceが存在する）事を条件にAnalyzerが初期化、動作する
  return { analyzerData };
}
