"use client";

import { AudioBuffer, Settings } from "@sharedTypes/types";
import { useState, useEffect, useRef } from "react";
import { Button, Box, IconButton, Typography, CircularProgress } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { useAudioRecorder } from "@audio/useAudioRecorder";
import { useAudioAnalyzer } from "@audio/useAudioAnalyzer";
import { useAudioCountIn } from "@audio/useAudioCountIn";
import { useAudioMetronome } from "@audio/useAudioMetronome";
import { AnalyzerVisualization } from "@Project/core_logic/AnalyzerVisualization";

export function RecordingCore({ onRecordingComplete, settings}: { onRecordingComplete: (audioBuffer: AudioBuffer) => void; settings: Settings}){
  const [ isRecording, setIsRecording ] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false); //録音時初期化
  const [isInitializing, setIsInitializing] = useState<boolean>(false); // 初期化中のフラグ(useEffectの制御)
  const [loading, setLoading] = useState<boolean>(false); // ローディング状態

  //WebAudioApi関連
  const audioContextRef = useRef<AudioContext | null>(null); //メトロノームと共有
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const clickSoundBufferRef = useRef<AudioBuffer | null>(null); //メトロノームとカウントインに渡す用

  //フック関連
  const { isCountingIn, startCountIn, countInInitialize } = useAudioCountIn();
  const { metronomeInitialize, startMetronome, stopMetronome } = useAudioMetronome();
  const { analyzerData, initializeAnalyzer, cleanupAnalyzer } = useAudioAnalyzer();
  const { init, start, stop, audioBuffer, cleanupRecording } = useAudioRecorder({settings,audioContextRef, audioWorkletNodeRef, mediaStreamSourceRef,setLoading, setIsRecording, cleanupAnalyzer, stopMetronome});

  //録音フィードバック関連
  const [remainingTime, setRemainingTime] = useState<number>(settings.duration ?? 30); // 残り時間（デフォルトは30秒）

  //初期化関数
  const initializeRecording = async (isMounted: () => boolean): Promise<void> => {
    if (isInitialized || isInitializing || !isMounted()) return;
    setIsInitializing(true);
    try {
      if (!isMounted()) return; // アンマウント後は中断
      const initResult = await init(isMounted);
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

  //レンダリング時に初期化関数実行
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] RecordingCoreがマウントされました`);
    console.log("RecordingCore: 初期化前のAudioContextの状態", audioContextRef.current?.state);
    console.log("RecordingCore: 初期化前のMediaStreamSourceの状態", mediaStreamSourceRef.current);
    console.log("RecordingCore: 初期化前のaudioWorkletNodeRefの状態", audioWorkletNodeRef.current);
    console.log("RecordingCore: 初期化前のclickSoundBufferRefの状態", clickSoundBufferRef.current);
    console.log("RecordingCore: 初期化状態のフラグ (isInitialized):", isInitialized);
    console.log("RecordingCore: 初期化中のフラグ (isInitializing):", isInitializing);



    let isMounted = true; // マウント状態を追跡

    //初期化処理
    initializeRecording(() => isMounted); //最新のisMountedを参照する関数として渡す



    // クリーンアップ処理
    return () => {
      isMounted = false; // アンマウントを記録

      console.log(`RecordingCoreがアンマウントされました[${new Date().toISOString()}]`);
      console.log("RecordingCore: クリーンアップ開始");

      cleanupAnalyzer(mediaStreamSourceRef.current);
      cleanupRecording();
      setIsRecording(false);
      stopMetronome();
      setIsInitialized(false);
      setIsInitializing(false);
      console.log("RecordingCore: クリーンアップ完了");
    };
  }, []);

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


  // 録音停止処理
  const handleStopRecording = async(): Promise<void> => {
    // サークルを表示するためにloadingをtrueに設定
    setLoading(true);
    setIsRecording(false);
    // 次の処理を非同期で遅延させて再レンダリングを待つ
    setTimeout(async () => {
      console.log("stop()発動");
      stop();
      // 完了後にloadingをfalseに設定
      setLoading(false);
    }, 100); // 状態が確実に反映されるように非同期で処理を遅らせる
  };

  // 録音中・カウントイン中で共通の録音開始フロー
  const startRecording = (): void => {
    console.log("startRecording 内の audioContext:", audioContextRef.current);
    setRemainingTime(settings.duration || 0);
    setIsRecording(true);
    start();
    console.log("start()発動");

    //メトロノーム設定があればメトロノーム初期化と開始
    if (settings.metronomeOn) {
      startMetronome(settings.tempo);
    }
  };

  //録音停止をフックに生成されるaudioBufferを親へ渡す(audioBufferは停止時一度のみ生成)
  useEffect(() => {
    if (audioBuffer) {
      onRecordingComplete(audioBuffer);
      console.log("親へバッファーを渡す",audioBuffer);
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
      pb:10,
      gap:2
      }}>
        <Box sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          {/* <Button variant="secondary" startIcon={<SettingsIcon />}>マイク選択</Button> */}
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
          <IconButton disabled={isInitializing} onClick={isRecording ? handleStopRecording : handleStartRecording} sx={{ color:"red", pl: 0 }}>
                  {!isRecording ? <RadioButtonCheckedIcon sx={{fontSize: "6rem"}}/> : <StopCircleIcon sx={{fontSize: "6rem"}}/>}
          </IconButton>
          )}
        </Box>
    </Box>
  );
};