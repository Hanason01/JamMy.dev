import { useState, useRef } from "react";

export function useAudioRecorder() {
  const audioContextRef = useRef(null);
  const mediaStreamSourceRef = useRef(null);
  const audioWorkletNodeRef = useRef(null);

  const [audioBuffer, setAudioBuffer] = useState(null);

  //初期化関数
  const init = async () => {
    try {
      console.log("AudioContext の初期化を開始");
      //(1)AudioContextのインスタンス作成
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      console.log("AudioContext の初期化に成功",audioContextRef.current);

      //(2)デバイスからの音声ストリーム取得
      console.log("マイク入力を取得開始");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("マイク入力の取得に成功",stream);

      //(3)MediaStreamSourceの作成
      console.log("MediaStreamSource の作成");
      mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      console.log("MediaStreamSourceの内容:", mediaStreamSourceRef.current);

      // (4)AudioWorkletProcessorの登録
      console.log("AudioWorkletProcessor の登録を開始");
      await audioContextRef.current.audioWorklet.addModule("scripts/record_processor.js"); //front/public/scripts/record_processor.js
      console.log("AudioWorkletProcessor の登録に成功",audioContextRef.current);

      // (5)AudioWorkletNode作成(このタイミングでProcessorが自動で初期化)
      audioWorkletNodeRef.current = new AudioWorkletNode(audioContextRef.current, "record-processor");
      console.log("AudioWorkletNode の作成に成功",audioWorkletNodeRef.current);

      // (6)MediaStreamSourceとAudioWorkletNodeを接続
      mediaStreamSourceRef.current.connect(audioWorkletNodeRef.current);
      console.log("MediaStreamSource の作成と接続に成功",mediaStreamSourceRef.current);

    } catch (error) {
    console.error("初期化エラー:", error);
    }

    // 録音終了時のプロセッサとの連携処理
    audioWorkletNodeRef.current.port.onmessage = (event) => {
      if (event.data.type === "complete") {
        // 録音停止時にプロセッサから送られた最終データを処理
        processCompleteData(event.data.audioData);
      }
    };
  };

  //録音開始
  const start = () => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "start" }); //プロセッサに録音開始を指示
      console.log("録音を開始しました");
    }
  };

  // 録音停止
  const stop = () => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "stop" }); // プロセッサに録音停止を指示
      console.log("録音を停止しました");
    }
  };

    // 完成データの処理（
    const processCompleteData = async (audioData) => {
      if (!audioContextRef.current) return;

      // Float32Array を統合(一次元配列化)して arrayBuffer に変換
      const flatData = audioData.reduce((acc, val) => acc.concat(Array.from(val)), []);
      console.log("flatData:", flatData);

      // AudioBuffer を手動で作成
      const audioBuffer = audioContextRef.current.createBuffer(1, flatData.length, audioContextRef.current.sampleRate);
      audioBuffer.getChannelData(0).set(flatData);
      setAudioBuffer(audioBuffer);
      console.log("録音データが AudioBuffer に変換されました");
    };

  return { init, start, stop, audioBuffer, audioContext:audioContextRef.current, mediaStreamSource:mediaStreamSourceRef.current };
}
