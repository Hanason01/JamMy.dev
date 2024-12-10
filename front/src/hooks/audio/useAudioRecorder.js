import { useState } from "react";

export function useAudioRecorder(settings, audioContextRef,audioWorkletNodeRef, mediaStreamSourceRef, setLoading, setIsRecording, cleanupAnalyzer, stopMetronome) {

  const [audioBuffer, setAudioBuffer] = useState(null);

  //初期化関数
  const init = async (isMounted) => {
    if (!isMounted()) return; // アンマウント後は中断
    try {
      console.log("AudioContext の初期化を開始");

      //(1)AudioContextのインスタンス作成
      if (!isMounted()) return;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log("AudioContext の初期化に成功",audioContext);

      //(2)デバイスからの音声ストリーム取得
      if (!isMounted()) return;
      console.log("マイク入力を取得開始");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("マイク入力の取得に成功",stream);

      //(3)MediaStreamSourceの作成
      if (!isMounted()) return;
      console.log("MediaStreamSource の作成");
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      console.log("MediaStreamSourceの内容:", mediaStreamSource);

      // (4)AudioWorkletProcessorの登録
      if (!isMounted()) return;
      console.log("AudioWorkletProcessor の登録を開始");
      await audioContext.audioWorklet.addModule("scripts/record_processor.js"); //front/public/scripts/record_processor.js
      console.log("AudioWorkletProcessor の登録に成功",audioContext);

      // (5)AudioWorkletNode作成(このタイミングでProcessorが自動で初期化)
      if (!isMounted()) return;
      const audioWorkletNode = new AudioWorkletNode(audioContext, "record-processor");
      console.log("AudioWorkletNode の作成に成功",audioWorkletNode);

      // (6) AudioWorkletNodeの初期化完了待ちとメッセージハンドラの初期化
      if (!isMounted()) return;
      console.log("プロセッサーの準備完了を待機します");
      const processorReady = await new Promise((resolve) => {
        audioWorkletNode.port.onmessage = (event) => {
          console.log("メッセージを受信:", event.data.type);

          //readyメッセージのハンドラ
          if (event.data.type === "ready") {
            console.log("プロセッサーが準備完了しました");
            resolve(true);
          }

          //completeメッセージのハンドラ
          if (event.data.type === "complete") {
            setLoading(true);
            setIsRecording(false);
            cleanupAnalyzer(mediaStreamSource);
            stopMetronome();
            setTimeout(async () => {
             // 録音停止時にプロセッサから送られた最終データを処理
              processCompleteData(event.data.audioData);
              setLoading(false);
            }, 100);
            console.log("complete メッセージの処理が完了しました");
          }
        };
      })

      // (7)MediaStreamSourceとAudioWorkletNodeを接続
      if (!processorReady || !isMounted()) return;
      console.log("MediaStreamSourceとAudioWorkletNodeの接続を開始");
      mediaStreamSource.connect(audioWorkletNode);
      console.log("MediaStreamSourceとAudioWorkletNodeの接続に成功",mediaStreamSource);

      // (8) クリック音をロード
      if (!isMounted()) return;
      console.log("クリック音をロード開始");
      const response = await fetch("/audios/click-sound.mp3");
      const arrayBuffer = await response.arrayBuffer();
      const clickSoundBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log("クリック音がロードされました", clickSoundBuffer);


      // //(9) AudioContext を suspend 状態にする（録音準備状態）
      // if (!isMounted()) return;
      // console.log("AudioContext を suspend 状態にします");
      // await audioContext.suspend();
      // console.log("AudioContext が suspend 状態になりました");

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
      // //AudioContextをruntimeにする
      // if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      //   console.log("AudioContextをresumeします");
      //   audioContextRef.current.resume();
      //   console.log("AudioContextがrunning状態になりました");
      // }
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
    // データの検証を追加
    if (!audioData || audioData.length === 0 || !audioData[0] || audioData[0].length === 0) {
      console.error("無効な録音データが検出されました: ", audioData);
      // プロセッサーに停止を指示（エラー時も停止を保証）
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.port.postMessage({ type: "terminate" });
      }
      return; // 無効なデータの場合は処理を中止
    }

    // Float32Array を統合(一次元配列化)して arrayBuffer に変換
    const flatData = audioData.reduce((acc, val) => acc.concat(Array.from(val)), []);
    console.log("flatData:", flatData);

    // AudioBuffer を手動で作成
    console.log("AudioBuffer手動作成の部分:context",audioContextRef.current);
    const audioBuffer = audioContextRef.current.createBuffer(1, flatData.length, audioContextRef.current.sampleRate);
    audioBuffer.getChannelData(0).set(flatData);
    setAudioBuffer(audioBuffer);
    console.log("録音データが AudioBuffer に変換されました");

    // プロセッサーに停止を指示
    if (audioWorkletNodeRef.current) {
    audioWorkletNodeRef.current.port.postMessage({ type: "terminate" });
    console.log("プロセッサーに terminate メッセージを送信しました");
    }
  };

  // 録音クリーンアップ関数
  const cleanupRecording = () => {
    console.log("RecordingHook: クリーンアップ開始");

    // (1) AudioWorkletNode のクリーンアップ
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "terminate" }); // terminateメッセージを送信
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
      console.log("AudioWorkletNode をクリーンアップしました",audioWorkletNodeRef.current);
    }

    // (2) MediaStreamSource のクリーンアップ
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
      console.log("MediaStreamSource をクリーンアップしました",mediaStreamSourceRef.current);
    }

    // (3) AudioContextのクリーンアップ
      if (audioContextRef.current) {
        // audioContextRef.current.close().then(() => {
          audioContextRef.current = null;
          console.log("AudioContext を閉じました",audioContextRef.current);
        // });
      }

    console.log("RecordingHook: クリーンアップ完了");
  };

  return { init, start, stop, audioBuffer, cleanupRecording };
}
