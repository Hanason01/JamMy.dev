import { useState } from "react";
import {AudioBuffer, Settings } from "@sharedTypes/types";

export function useAudioRecorder({
  settings,
  audioContextRef,
  audioWorkletNodeRef,
  mediaStreamSourceRef,
  setLoading,
  setIsRecording,
  cleanupAnalyzer,
  stopMetronome
} : {
  settings: Settings;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
  audioWorkletNodeRef: React.MutableRefObject<AudioWorkletNode | null>;
  mediaStreamSourceRef: React.MutableRefObject<MediaStreamAudioSourceNode | null>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  cleanupAnalyzer: (mediaStreamSource: MediaStreamAudioSourceNode | null) => void;
  stopMetronome: () => void;
}) {

  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>(null);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);

  //初期化関数
  const init = async (isMounted: () => boolean, deviceId?: string | null) => {
    if (!isMounted()) return null; // アンマウント後は中断
    try {
      console.log("AudioContext の初期化を開始");

      //(1)AudioContextのインスタンス作成
      if (!isMounted()) return null;
      const audioContext = new (window.AudioContext ||(window as any).webkitAudioContext)();
      console.log("AudioContext の初期化に成功",audioContext);

      //(2)マイクデバイスリスト取得とデフォルトマイクの設定
      if (!isMounted()) return null;
      console.log("マイクデバイスのリストを取得開始");
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter((device) => device.kind === "audioinput");
      setMicrophones(audioDevices); // マイクリストを保存
      console.log("audioDevices", audioDevices);

      const micId = deviceId ? deviceId : audioDevices.length > 0 ? audioDevices[0].deviceId : null;
      console.log("initが受け取ったdeviceId", deviceId);
      console.log("これから接続すべきmicID", micId);
      if (!micId) {
        console.warn("利用可能なマイクが見つかりませんでした");
        return null; // マイクがない場合は初期化を中止
      }

      //(3)デフォルトマイクの音声ストリーム取得
      if (!isMounted()) return null;
      console.log("マイク入力を取得開始");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: micId } },
      });
      console.log("マイク入力の取得に成功",stream);

      //(4)MediaStreamSourceの作成
      if (!isMounted()) return null;
      console.log("MediaStreamSource の作成");
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      console.log("MediaStreamSourceの内容:", mediaStreamSource);

      // (5)AudioWorkletProcessorの登録
      if (!isMounted()) return null;
      console.log("AudioWorkletProcessor の登録を開始");
      await audioContext.audioWorklet.addModule("scripts/record_processor.js"); //front/public/scripts/record_processor.js
      console.log("AudioWorkletProcessor の登録に成功",audioContext);

      // (6)AudioWorkletNode作成(このタイミングでProcessorが自動で初期化)
      if (!isMounted()) return null;
      const audioWorkletNode = new AudioWorkletNode(audioContext, "record-processor");
      console.log("AudioWorkletNode の作成に成功",audioWorkletNode);

      // (7) AudioWorkletNodeの初期化完了待ちとメッセージハンドラの初期化
      if (!isMounted()) return null;
      console.log("プロセッサーの準備完了を待機します");
      const processorReady = await new Promise<boolean>((resolve) => {
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

      // (8)MediaStreamSourceとAudioWorkletNodeを接続
      if (!processorReady || !isMounted()) return null;
      console.log("MediaStreamSourceとAudioWorkletNodeの接続を開始");
      mediaStreamSource.connect(audioWorkletNode);
      console.log("MediaStreamSourceとAudioWorkletNodeの接続に成功",mediaStreamSource);

      // (9) クリック音をロード
      if (!isMounted()) return null;
      console.log("クリック音をロード開始");
      const response = await fetch("/audios/click-sound.mp3");
      const arrayBuffer = await response.arrayBuffer();
      const clickSoundBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log("クリック音がロードされました", clickSoundBuffer);

      //初期化結果を返す（初期化後状態変数登録が必要になる為、フックのreturnとは別でreturn)
      return { audioContext, mediaStreamSource, audioWorkletNode, clickSoundBuffer };
    } catch (error) {
    console.error("初期化エラー:", error);
    return null;
    }
  };

  //録音開始
  const start = (): void => {
    console.log("useAudioRecorderフックのstartが受け取るsettings",settings);
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "start",duration: settings.duration }); //プロセッサに録音開始と秒数を指示
      console.log(`録音を開始しました (最大 ${settings.duration} 秒)`);
    }
  };

  // 録音停止
  const stop = (): void => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "stop" }); // プロセッサに録音停止を指示
      console.log("録音を停止しました");
    }
  };

  // 完成データの処理（
  const processCompleteData = async (audioData: Float32Array[]): Promise<void> => {
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
    const flatData = audioData.reduce<number[]>((acc, val: Float32Array) => acc.concat(Array.from(val)), []);
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
  const cleanupRecording = (): void => {
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
          audioContextRef.current = null;
          console.log("AudioContext を閉じました",audioContextRef.current);
      }

    console.log("RecordingHook: クリーンアップ完了");
  };

  return {
    init,
    start,
    stop,
    audioBuffer,
    cleanupRecording,
    microphones,
  };
}
