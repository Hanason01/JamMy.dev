"use client";

import { AudioBuffer, Settings, SetState } from "@sharedTypes/types";
import { useState, useEffect, useRef } from "react";
import { Button, Box, IconButton, Typography, CircularProgress, Menu, MenuItem } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { useAudioRecorder } from "@audio/useAudioRecorder";
import { useAudioAnalyzer } from "@audio/useAudioAnalyzer";
import { useAudioCountIn } from "@audio/useAudioCountIn";
import { useAudioMetronome } from "@audio/useAudioMetronome";
import { AnalyzerVisualization } from "@Project/core_logic/AnalyzerVisualization";
import { usePlayback } from "@context/usePlayBackContext";

export function RecordingCore({
  id,
  globalAudioContext,
  onRecordingComplete,
  settings,
  enablePostAudio = false, //渡されなかった場合はfalseとする

} : {
  id?: string;  //オプショナル
  globalAudioContext?: AudioContext | null; //オプショナル
  onRecordingComplete: (audioBuffer: AudioBuffer) => void;
  settings: Settings;
  enablePostAudio?: boolean; //オプショナル
}){
  const [ isRecording, setIsRecording ] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false); //録音時初期化
  const [isInitializing, setIsInitializing] = useState<boolean>(false); // 初期化中のフラグ(useEffectの制御)
  const [loading, setLoading] = useState<boolean>(false); // ローディング状態
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  //WebAudioApi関連
  const audioContextRef = useRef<AudioContext | null>(null); //メトロノームと共有
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const clickSoundBufferRef = useRef<AudioBuffer | null>(null); //メトロノームとカウントインに渡す用

  //Context関連
  const {setIsPlaybackTriggered, playbackTriggeredByRef, setIsPlaybackReset, playbackResetTriggeredByRef} = usePlayback();

  //フック関連
  const { isCountingIn, startCountIn, countInInitialize } = useAudioCountIn();
  const { metronomeInitialize, startMetronome, stopMetronome } = useAudioMetronome();
  const { analyzerData, initializeAnalyzer, cleanupAnalyzer } = useAudioAnalyzer();
  const { init, start, stop, audioBuffer, cleanupRecording, microphones } = useAudioRecorder(
    {
    globalAudioContext,
    settings,
    audioContextRef,
    audioWorkletNodeRef,
    mediaStreamSourceRef,
    setLoading,
    setIsRecording,
    cleanupAnalyzer,
    stopMetronome,
    setIsPlaybackTriggered,
    playbackTriggeredByRef,
    enablePostAudio,
    id
  });

  //録音フィードバック関連
  const [remainingTime, setRemainingTime] = useState<number>(settings.duration ?? 30); // 残り時間（デフォルトは30秒）

  //初期化関数
  const initializeRecording = async (isMounted: () => boolean): Promise<void> => {
    console.log("初期化関数開始");
    if (isInitialized || isInitializing || !isMounted()){
      console.log("initializedがfalse", isInitialized);
      console.log("initializingがfalse", isInitializing);
      console.log("isMounted()がfalse", isMounted());
      return;
    }
    setIsInitializing(true);
    try {
      if (!isMounted()) return; // アンマウント後は中断
      const initResult = await init(isMounted, selectedDeviceId);
      if (!initResult) {
        console.warn("init() が中断されました。初期化処理を中止します。");
        return;
      }

      const { audioContext, mediaStreamSource, audioWorkletNode, clickSoundBuffer } = initResult;

      // Ref保持
      if (!isMounted()) return;
      audioContextRef.current = audioContext;
      mediaStreamSourceRef.current = mediaStreamSource;
      audioWorkletNodeRef.current = audioWorkletNode;
      clickSoundBufferRef.current = clickSoundBuffer;
      console.log("init()完了");
      console.log("init()の戻り値があるか", audioContext,  mediaStreamSource, audioWorkletNode,clickSoundBuffer);

      // アナライザー初期化
      if (audioContext && mediaStreamSource && isMounted()) {
        console.log("アナライザー初期化時点のcotextとmediasource", audioContext, mediaStreamSource);
        initializeAnalyzer(audioContext, mediaStreamSource);
        console.log("アナライザー初期化完了");
      }

      // カウントイン初期化
      if(isMounted())countInInitialize(clickSoundBuffer); //カウントインは別context管理
      //メトロノーム初期化
      if(isMounted())metronomeInitialize(audioContext, clickSoundBuffer);

      if(isMounted()){
        setIsInitialized(true);
        console.log("RecordingCoreの初期化完了");
      }
    }catch (e) {
      console.error("録音初期化に失敗しました", e);
    }finally{
      if(isMounted())setIsInitializing(false);
    }
  };

  //初期化リセット関数
  const resetInitialization = () => {
    console.log("初期化リセット開始");
    cleanupAnalyzer(mediaStreamSourceRef.current);
    cleanupRecording();
    stopMetronome();
    setIsRecording(false);
    setIsInitialized(false);
    setIsInitializing(false);
    if (enablePostAudio && id) {
      playbackTriggeredByRef.current=null;
    }
    console.log("初期化リセット完了");
  };

  //レンダリング時に初期化関数実行
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] RecordingCoreがマウントされました`);
    // console.log("RecordingCore: 初期化前のAudioContextの状態", audioContextRef.current?.state);
    // console.log("RecordingCore: 初期化前のMediaStreamSourceの状態", mediaStreamSourceRef.current);
    // console.log("RecordingCore: 初期化前のaudioWorkletNodeRefの状態", audioWorkletNodeRef.current);
    // console.log("RecordingCore: 初期化前のclickSoundBufferRefの状態", clickSoundBufferRef.current);
    // console.log("RecordingCore: 初期化状態のフラグ (isInitialized):", isInitialized);
    // console.log("RecordingCore: 初期化中のフラグ (isInitializing):", isInitializing);

    let isMounted = true; // マウント状態を追跡

    //初期化処理
    initializeRecording(() => isMounted); //最新のisMountedを参照する関数として渡す

    // クリーンアップ処理
    return () => {
      isMounted = false; // アンマウントを記録

      console.log(`RecordingCoreがアンマウントされました[${new Date().toISOString()}]`);
      console.log("RecordingCore: クリーンアップ開始");
      resetInitialization();
      console.log("RecordingCore: クリーンアップ完了");
    };
  }, [selectedDeviceId]);

  //マイク選択処理
  const handleMicSelect = async (deviceId: string) => {
    setMenuAnchor(null); // メニューを閉じる
    resetInitialization(); // 初期化リセットを待つ
    setSelectedDeviceId(deviceId); //選択されたマイクIDの保持
  };


  // 録音開始処理
  const handleStartRecording = async (): Promise<void> => {
    if (settings.countIn > 0) {
      startCountIn(settings, () => {
        console.log("startRecording呼び出しタイミング:", performance.now()); // コールバックの呼び出しタイミング
        startRecording(); // 鳴らし終えたタイミングでstartRecording発動
      });
    } else {
      console.log("startRecording呼び出しタイミング（カウントインなし）:", performance.now());
      startRecording(); // CountIn指定なしではそのままstartRecoding発動
    }
  };

  // 録音中・カウントイン中で共通の録音開始フロー
  const startRecording = (): void => {
    console.log("startRecording 内の audioContext:", audioContextRef.current);
    setRemainingTime(settings.duration || 0);
    setIsRecording(true);
    start();
    console.log("start()発動");

    // enablePostAudio が有効な場合にトリガーをセット
      if (enablePostAudio && id) {
      playbackTriggeredByRef.current=id;
      setIsPlaybackTriggered(true); // AudioPlayer.tsxがキャッチ
      console.log("enablePostAudio が有効なため、再生トリガーを設定しました");
    }

    //メトロノーム設定があればメトロノーム初期化と開始
    if (settings.metronomeOn) {
      startMetronome(settings.tempo);
    }
  };

  // 録音停止処理
  const handleStopRecording = async(): Promise<void> => {
    // サークルを表示するためにloadingをtrueに設定
    setLoading(true);
    setIsRecording(false);
    stop();
    console.log("stop()発動");
  };

  //録音停止をフックに生成されるaudioBufferを親へ渡す(audioBufferは停止時一度のみ生成)
  useEffect(() => {
    if (audioBuffer) {
      onRecordingComplete(audioBuffer);
      console.log("親へバッファーを渡す",audioBuffer);
    }
    if(enablePostAudio) {
      setIsPlaybackReset(true); //投稿音声をリセット
      playbackResetTriggeredByRef.current = "Recording";
    }
  }, [audioBuffer]);

  // 残り時間を同期反映する
  useEffect(() => {
    setRemainingTime(settings.duration || 30);
  }, [settings.duration]);

  //残り時間表示
  useEffect(() => {
    let timerId: number | undefined;
    if (isRecording) {
      timerId = window.setInterval(() => {
        setRemainingTime((prev) => Math.max(prev - 0.1, 0)); // 0.1秒単位で更新
      }, 100); // 1秒ごと
    } else {
      clearInterval(timerId);
    }
    return () => clearInterval(timerId); // クリーンアップ
  }, [isRecording]);

   // 分:秒形式に変換
  const formatRemainingTime = (): string => {
    const minutes = Math.floor(remainingTime / 60); // 分を計算
    const seconds = (remainingTime % 60).toFixed(1); // 秒（小数点1桁）
    return `${minutes}:${seconds.padStart(4, "0")}`; // "分:秒.0"の形式
  };

  return(
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      gap:2
      }}>
        <Box sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          <Button
          variant="secondary"
          startIcon={<SettingsIcon/>}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          disabled={!isInitialized || isRecording}
          >マイク選択</Button>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          {microphones.map((mic) => (
            <MenuItem
              key={mic.deviceId}
              selected={mic.deviceId === selectedDeviceId}
              onClick={() => handleMicSelect(mic.deviceId)}
            >
              {mic.label || `マイク (${mic.deviceId})`}
            </MenuItem>
          ))}
          </Menu>
        </Box>
        {isInitialized? (
          <Box sx= {{display: "flex",
            flexDirection: "column",
            alignItems: "center",}}>
            <Typography variant="h6">{formatRemainingTime()}</Typography>
            <AnalyzerVisualization analyzerData={analyzerData}/>
          </Box>
          ) : (
          <Box sx={{ width: "400px", height: "132px" }} />
          )}
        <Box>
          {loading ? (
            <CircularProgress
              size={64}
              sx={{
                color: "primary",
              }}
            />
          ) : (
          <IconButton disabled={isInitializing} onClick={isRecording ? handleStopRecording : handleStartRecording}
          sx={{ color:"#e53935", pl: 0 }}>
                  {!isRecording ? <RadioButtonCheckedIcon sx={{fontSize: "6rem"}}/> : <StopCircleIcon sx={{fontSize: "6rem"}}/>}
          </IconButton>
          )}
        </Box>
    </Box>
  );
};