import { useState } from "react";

export function useAudioRecorder(settings, audioContextRef,audioWorkletNodeRef, setLoading, setIsRecording, cleanupAnalyzer, stopMetronome) {

  const [audioBuffer, setAudioBuffer] = useState(null);

  //初期化関数
  const init = async () => {
    try {
      console.log("AudioContext の初期化を開始");
      //(1)AudioContextのインスタンス作成
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log("AudioContext の初期化に成功",audioContext);

      //(2)デバイスからの音声ストリーム取得
      console.log("マイク入力を取得開始");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("マイク入力の取得に成功",stream);

      //(3)MediaStreamSourceの作成
      console.log("MediaStreamSource の作成");
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      console.log("MediaStreamSourceの内容:", mediaStreamSource);

      // (4)AudioWorkletProcessorの登録
      console.log("AudioWorkletProcessor の登録を開始");
      await audioContext.audioWorklet.addModule("scripts/record_processor.js"); //front/public/scripts/record_processor.js
      console.log("AudioWorkletProcessor の登録に成功",audioContext);

      // (5)AudioWorkletNode作成(このタイミングでProcessorが自動で初期化)
      const audioWorkletNode = new AudioWorkletNode(audioContext, "record-processor");
      console.log("AudioWorkletNode の作成に成功",audioWorkletNode);

      // (6)MediaStreamSourceとAudioWorkletNodeを接続
      mediaStreamSource.connect(audioWorkletNode);
      console.log("MediaStreamSource の作成と接続に成功",mediaStreamSource);

      // (7) クリック音をロード
      console.log("クリック音をロード開始");
      const response = await fetch("/audios/click-sound.mp3");
      const arrayBuffer = await response.arrayBuffer();
      const clickSoundBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log("クリック音がロードされました", clickSoundBuffer);

      // (8) AudioWorkletNode のメッセージ処理を設定
      audioWorkletNode.port.onmessage = (event) => {
        console.log("メッセージを受け取った:audioWorkletNodeは",audioWorkletNode)
        console.log("メッセージの種類:", event.data.type);
        if (event.data.type === "complete") {
          setLoading(true);
          setIsRecording(false);
          cleanupAnalyzer();
          stopMetronome();
          setTimeout(async () => {
           // 録音停止時にプロセッサから送られた最終データを処理
            processCompleteData(event.data.audioData);
            setLoading(false);
          }, 100);
          console.log("completeをワークレットから受け取りprocessCompleteDataを行う");
        }
      };
      //(9) AudioContext を suspend 状態にする（録音準備状態）
      console.log("AudioContext を suspend 状態にします");
      await audioContext.suspend();
      console.log("AudioContext が suspend 状態になりました");

      //初期化結果を返す（初期化後状態変数登録が必要になる為、フックのreturnとは別でreturn)
      return { audioContext, mediaStreamSource, audioWorkletNode, clickSoundBuffer };
    } catch (error) {
    console.error("初期化エラー:", error);
    }
  };

  //録音開始
  const start = () => {
    console.log("useAudioRecorderフックのstartが受け取るsettings",settings);
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "start",duration: settings.duration }); //プロセッサに録音開始と秒数を指示
      console.log(`録音を開始しました (最大 ${settings.duration} 秒)`);
      //AudioContextをruntimeにする
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        console.log("AudioContextをresumeします");
        audioContextRef.current.resume();
        console.log("AudioContextがrunning状態になりました");
      }
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
      console.log("AudioBuffer手動作成の部分:context",audioContextRef.current);
      const audioBuffer = audioContextRef.current.createBuffer(1, flatData.length, audioContextRef.current.sampleRate);
      audioBuffer.getChannelData(0).set(flatData);
      setAudioBuffer(audioBuffer);
      console.log("録音データが AudioBuffer に変換されました");
    };

  return { init, start, stop, audioBuffer };
}
