import { useState } from "react";
import {AudioBuffer, Settings, SetState } from "@sharedTypes/types";
import { useSettingAudioSession } from "@utils/useSettingAudioSession";

export function useAudioRecorder({
  globalAudioContext,
  settings,
  audioContextRef,
  audioWorkletNodeRef,
  mediaStreamSourceRef,
  setLoading,
  setIsRecording,
  setInitializedDeviceId,
  cleanupAnalyzer,
  stopMetronome,
  setIsPlaybackTriggered,
  playbackTriggeredByRef,
  enablePostAudio,
  id
} : {
  globalAudioContext?: AudioContext | null;
  settings: Settings;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
  audioWorkletNodeRef: React.MutableRefObject<AudioWorkletNode | null>;
  mediaStreamSourceRef: React.MutableRefObject<MediaStreamAudioSourceNode | null>;
  setLoading: SetState<boolean>;
  setIsRecording: SetState<boolean>;
  setInitializedDeviceId: SetState<string | null>;
  cleanupAnalyzer: (mediaStreamSource: MediaStreamAudioSourceNode | null) => void;
  stopMetronome: () => void;
  setIsPlaybackTriggered: SetState<boolean>;
  playbackTriggeredByRef: React.MutableRefObject<string | null>;
  enablePostAudio?: boolean;
  id?: string;
}) {

  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>(null);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);

  //フック
  const { settingAudioSession } = useSettingAudioSession();

  //初期化関数
  const init = async (isMounted: () => boolean, deviceId?: string | null) => {
    if (!isMounted()) return null;
    try {

      //(1)AudioContextのインスタンス作成
      if (!isMounted()) return null;
      const audioContext = globalAudioContext
      ? globalAudioContext
      : new (window.AudioContext ||(window as any).webkitAudioContext)({
        sampleRate: 44100
      });


      //(2) 初回のマイクアクセス要求 (必要に応じて仮のstreamを取得)
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      //(3)マイクデバイスリスト取得とデフォルトマイクの設定
      if (!isMounted()) return null;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter((device) => device.kind === "audioinput");
      setMicrophones(audioDevices);
      console.log("マイクリスト", audioDevices);

      const defaultMic = audioDevices.length > 0 ? audioDevices[0] : null;
      const airPodsMic = audioDevices.find(device => /airpods/i.test(device.label)); //i = 大文字小文字を区別しない。RegExp正規表現使用。
      const micId = deviceId || airPodsMic?.deviceId || defaultMic?.deviceId;

      if (!micId) {
        console.warn("利用可能なマイクが見つかりませんでした");
        return null;
      } else {
        if (!deviceId){ //初期化時にマイク選択(Menu Item)を明示する。!deviceId→マイク選択アクションなし
          setInitializedDeviceId(micId);
        } else{
          setInitializedDeviceId(null);
        }
      }

      //(4)デフォルトあるいは選択されたマイクの音声ストリーム取得
      if (!isMounted()) return null;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          latency: 0.01,
          noiseSuppression: false,
          echoCancellation: false,
          // autoGainControl: false,
          deviceId: { exact: micId } } as any,
      });

      // navigatorプロパティの変更（試験的運用）
      settingAudioSession();


      //(5)MediaStreamSourceの作成
      if (!isMounted()) return null;
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);

      //(6)AudioWorkletProcessorの登録
      if (!isMounted()) return null;
      await audioContext.audioWorklet.addModule("/scripts/record_processor.js"); //front/public/scripts/record_processor.js

      //(7)AudioWorkletNode作成(このタイミングでProcessorが自動で初期化)
      if (!isMounted()) return null;
      const audioWorkletNode = new AudioWorkletNode(audioContext, "record-processor");

      //(8) AudioWorkletNodeの初期化完了待ちとメッセージハンドラの初期化
      if (!isMounted()) return null;
      const processorReady = await new Promise<boolean>((resolve) => {
        audioWorkletNode.port.onmessage = (event) => {

          if (event.data.type === "ready") {
            resolve(true);
          }

          if (event.data.type === "complete") {
            setLoading(true);
            setIsRecording(false);
            cleanupAnalyzer(mediaStreamSource);
            stopMetronome();

            if (enablePostAudio && id) {
              playbackTriggeredByRef.current=id;
              setIsPlaybackTriggered(false);
            }

            processCompleteData(event.data.audioData);
            setLoading(false);
          }
        };
      })

      //(9)MediaStreamSourceとAudioWorkletNodeを接続
      if (!processorReady || !isMounted()) return null;
      mediaStreamSource.connect(audioWorkletNode);

      //(10) クリック音をロード
      if (!isMounted()) return null;
      const response = await fetch("/audios/click-sound.mp3");
      const arrayBuffer = await response.arrayBuffer();
      const clickSoundBuffer = await audioContext.decodeAudioData(arrayBuffer);

      return { audioContext, mediaStreamSource, audioWorkletNode, clickSoundBuffer };
    } catch (error) {
    console.error("初期化エラー:", error);
    return null;
    }
  };


  //録音開始
  const start = (): void => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "start",duration: settings.duration });
    }
  };

  // 録音停止
  const stop = (): void => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "stop" });
    }
  };

  // 完成データの処理（
  const processCompleteData = async (audioData: Float32Array[]): Promise<void> => {
    if (!audioContextRef.current) return;
    // データの検証を追加
    if (!audioData || audioData.length === 0 || !audioData[0] || audioData[0].length === 0) {
      console.error("無効な録音データが検出されました: ", audioData);
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.port.postMessage({ type: "terminate" });
      }
      return;
    }

    // 必要な総フレーム数を計算
    const totalFrames = audioData.reduce((acc, val) => acc + val.length, 0);
    const flatData = new Float32Array(totalFrames);

    // 各チャンクを直接コピー
    let offset = 0;
    for (const chunk of audioData) {
      flatData.set(chunk, offset);
      offset += chunk.length;
    }

    // AudioBuffer作成
    const audioBuffer = audioContextRef.current.createBuffer(1, flatData.length, audioContextRef.current.sampleRate);
    audioBuffer.getChannelData(0).set(flatData);
    setAudioBuffer(audioBuffer);

    if (audioWorkletNodeRef.current) {
    audioWorkletNodeRef.current.port.postMessage({ type: "terminate" });
    }
  };

  // 録音クリーンアップ関数
  const cleanupRecording = (): void => {

    // (1) AudioWorkletNode のクリーンアップ
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "terminate" }); // terminateメッセージを送信
      audioWorkletNodeRef.current.port.close();
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current.port.onmessage = null;
      audioWorkletNodeRef.current = null;
      // AudioWorkletNodeを切断し、参照を切ったとしてもChromeにおいては、メモリリークが発生するという問題「https://issues.chromium.org/issues/40823260」→現時点の最新の情報「https://issues.chromium.org/issues/40072701」が存在しており、未解決の問題。
    }
    // (2) マイクの MediaStream を解放
    if (mediaStreamSourceRef.current && mediaStreamSourceRef.current.mediaStream) {
      mediaStreamSourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
      console.log("マイクの解放");
    }

    // (3) MediaStreamSource のクリーンアップ
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }

    // (4) AudioContextのクリーンアップ
      if (audioContextRef.current && !globalAudioContext) {
          audioContextRef.current.close().then(() => {
            audioContextRef.current = null;
          });
          // globalAudioContextの場合はより上位のコンポーネントで抹消する為、こちらでは抹消しない。
      }
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
