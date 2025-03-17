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
    if (!isMounted()) return null; // アンマウント後は中断
    try {
      // console.log("AudioContext の初期化を開始");
      // (0)AudioSessionAPIによる、navigatorプロパティの変更
      settingAudioSession();

      //(1)AudioContextのインスタンス作成
      if (!isMounted()) return null;
      const audioContext = globalAudioContext
      ? globalAudioContext
      : new (window.AudioContext ||(window as any).webkitAudioContext)({
        sampleRate: 44100
      });
      // console.log("AudioContext の初期化に成功",audioContext);

      if (!globalAudioContext) {
        // console.log("新しい AudioContext を作成しました:", audioContext);
      } else {
        // console.log("globalAudioContext を使用します:", audioContext);
      }

      //(2) 初回のマイクアクセス要求 (必要に応じて仮のstreamを取得)
      // console.log("マイクアクセスの許可をリクエスト中...");
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // console.log("マイクアクセスに成功", tempStream);

      //(3)マイクデバイスリスト取得とデフォルトマイクの設定
      if (!isMounted()) return null;
      // console.log("マイクデバイスのリストを取得開始");
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter((device) => device.kind === "audioinput");
      setMicrophones(audioDevices); // マイクリストを保存
      console.log("マイクリスト", audioDevices);
      // console.log("audioDevices", audioDevices);

      const defaultMic = audioDevices.length > 0 ? audioDevices[0] : null;

      const airPodsMic = audioDevices.find(device => /airpods/i.test(device.label)); //i = 大文字小文字を区別しない。RegExp正規表現使用。

      const micId = deviceId || airPodsMic?.deviceId || defaultMic?.deviceId;
      // console.log("initが受け取ったdeviceId", deviceId);
      // console.log("これから接続すべきmicID", micId);
      if (!micId) {
        console.warn("利用可能なマイクが見つかりませんでした");
        return null; // マイクがない場合は初期化を中止
      } else {
        if (!deviceId){ //初期化時にマイク選択(Menu Item)を明示する。!deviceId→マイク選択アクションなし
          setInitializedDeviceId(micId);
        } else{
          setInitializedDeviceId(null);
        }
      }

      //(4)デフォルトあるいは選択されたマイクの音声ストリーム取得
      if (!isMounted()) return null;
      // console.log("マイク入力を取得開始");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1, //モノラル
          latency: 0.01,
          noiseSuppression: false, // ノイズ抑制オフ
          echoCancellation: false, // エコーキャンセルオフ
          autoGainControl: false, // ゲイン調整オフ
          deviceId: { exact: micId } } as any,
      });
      // 以上のオプションは録音時のマイク遅延を減らす為に前もって設定するもの


      //(5)MediaStreamSourceの作成
      if (!isMounted()) return null;
      // console.log("MediaStreamSource の作成");
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      // console.log("MediaStreamSourceの内容:", mediaStreamSource);

      //(6)AudioWorkletProcessorの登録
      if (!isMounted()) return null;
      // console.log("AudioWorkletProcessor の登録を開始");
      await audioContext.audioWorklet.addModule("/scripts/record_processor.js"); //front/public/scripts/record_processor.js
      // console.log("AudioWorkletProcessor の登録に成功",audioContext);

      //(7)AudioWorkletNode作成(このタイミングでProcessorが自動で初期化)
      if (!isMounted()) return null;
      const audioWorkletNode = new AudioWorkletNode(audioContext, "record-processor");
      // console.log("AudioWorkletNode の作成に成功",audioWorkletNode);

      //(8) AudioWorkletNodeの初期化完了待ちとメッセージハンドラの初期化
      if (!isMounted()) return null;
      // console.log("プロセッサーの準備完了を待機します");
      const processorReady = await new Promise<boolean>((resolve) => {
        audioWorkletNode.port.onmessage = (event) => {
          // console.log("メッセージを受信:", event.data.type);

          //readyメッセージのハンドラ
          if (event.data.type === "ready") {
            // console.log("プロセッサーが準備完了しました");
            resolve(true);
          }

          //completeメッセージのハンドラ
          if (event.data.type === "complete") {
            setLoading(true);
            setIsRecording(false);
            cleanupAnalyzer(mediaStreamSource);
            stopMetronome();
            // context関連を初期化（録音自然終了時を想定）
            if (enablePostAudio && id) {
              playbackTriggeredByRef.current=id;
              setIsPlaybackTriggered(false);
              // console.log("アンマウント、あるいは録音自動終了により、再生トリガーをリセットしました");
            }
            // 録音停止時にプロセッサから送られた最終データを処理
            processCompleteData(event.data.audioData);
            setLoading(false);
            // console.log("complete メッセージの処理が完了しました");
          }
        };
      })

      //(9)MediaStreamSourceとAudioWorkletNodeを接続
      if (!processorReady || !isMounted()) return null;
      // console.log("MediaStreamSourceとAudioWorkletNodeの接続を開始");
      mediaStreamSource.connect(audioWorkletNode);
      // console.log("MediaStreamSourceとAudioWorkletNodeの接続に成功",mediaStreamSource);

      //(10) クリック音をロード
      if (!isMounted()) return null;
      // console.log("クリック音をロード開始");
      const response = await fetch("/audios/click-sound.mp3");
      const arrayBuffer = await response.arrayBuffer();
      const clickSoundBuffer = await audioContext.decodeAudioData(arrayBuffer);
      // console.log("クリック音がロードされました", clickSoundBuffer);

      //初期化結果を返す（初期化後状態変数登録が必要になる為、フックのreturnとは別でreturn)

      return { audioContext, mediaStreamSource, audioWorkletNode, clickSoundBuffer };
    } catch (error) {
    console.error("初期化エラー:", error);
    return null;
    }
  };


  //録音開始
  const start = (): void => {
    // console.log("useAudioRecorderフックのstartが受け取るsettings",settings);
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "start",duration: settings.duration }); //プロセッサに録音開始と秒数を指示
      // console.log(`録音を開始しました (最大 ${settings.duration} 秒)`);
    }
  };

  // 録音停止
  const stop = (): void => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "stop" }); // プロセッサに録音停止を指示
      // console.log("録音を停止しました");
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

    // 必要な総フレーム数を計算
    const totalFrames = audioData.reduce((acc, val) => acc + val.length, 0);
    const flatData = new Float32Array(totalFrames); // 必要なサイズで配列を確保

    // 各チャンクを直接コピー
    let offset = 0;
    for (const chunk of audioData) {
      flatData.set(chunk, offset);
      offset += chunk.length;
    }

    // AudioBuffer を手動で作成
    // console.log("AudioBuffer手動作成の部分:context",audioContextRef.current);
    const audioBuffer = audioContextRef.current.createBuffer(1, flatData.length, audioContextRef.current.sampleRate);
    audioBuffer.getChannelData(0).set(flatData);
    setAudioBuffer(audioBuffer);
    // console.log("録音データが AudioBuffer に変換されました");

    // プロセッサーに停止を指示
    if (audioWorkletNodeRef.current) {
    audioWorkletNodeRef.current.port.postMessage({ type: "terminate" });
    // console.log("プロセッサーに terminate メッセージを送信しました");
    }
  };

  // 録音クリーンアップ関数
  const cleanupRecording = (): void => {
    // console.log("RecordingHook: クリーンアップ開始");

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
      // console.log("MediaStreamSource をクリーンアップしました",mediaStreamSourceRef.current);
    }

    // (4) AudioContextのクリーンアップ
      if (audioContextRef.current && !globalAudioContext) {
          audioContextRef.current.close().then(() => {
            audioContextRef.current = null;
          });
          // globalAudioContextの場合はより上位のコンポーネントで抹消する為、こちらでは抹消しない。

          // console.log("AudioContext を閉じました",audioContextRef.current);
      }

    // console.log("RecordingHook: クリーンアップ完了");
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
