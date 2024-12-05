"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Box, IconButton, Typography } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { useAudioRecorder } from "../../../hooks/audio/useAudioRecorder";
import { useAudioAnalyzer } from "../../../hooks/audio/useAudioAnalyzer";
import { useAudioCountIn } from "../../../hooks/audio/useAudioCountIn";
import { useAudioMetronome } from "../../../hooks/audio/useAudioMetronome";
import { AnalyzerVisualization } from "./AnalyzerVisualization"

export function RecordingCore({ onRecordingComplete, settings}){
  const [ isRecording, setIsRecording ] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); //録音時初期化
  const [isInitializing, setIsInitializing] = useState(false); // 初期化中のフラグ(useEffectの制御)

  //WebAudioApi関連
  const audioContextRef = useRef(null);
  const mediaStreamSourceRef = useRef(null);
  const audioWorkletNodeRef = useRef(null);
  const clickSoundBufferRef = useRef(null);

  //フック関連
  const { init, start, stop, audioBuffer } = useAudioRecorder(settings,audioContextRef, audioWorkletNodeRef);
  const { isCountingIn, startCountIn, countInInitialize } = useAudioCountIn( clickSoundBufferRef.current, settings);
  const { metronomeInitialize, startMetronome, stopMetronome } = useAudioMetronome(clickSoundBufferRef.current, settings);
  const { analyzerData, initializeAnalyzer, cleanupAnalyzer } = useAudioAnalyzer();
  // console.log("RecordingCore時点のクリック音声",clickSoundBuffer);

  //録音フィードバック関連
  const [remainingTime, setRemainingTime] = useState(settings.duration ?? 30); // 残り時間（デフォルトは30秒）

  //初期化関数
  const initializeRecording = async () => {
    if (isInitialized || isInitializing ) return;
    setIsInitializing(true);
    try {
      const { audioContext, mediaStreamSource, audioWorkletNode, clickSoundBuffer } = await init();

      // Ref保持
      audioContextRef.current = audioContext;
      mediaStreamSourceRef.current = mediaStreamSource;
      audioWorkletNodeRef.current = audioWorkletNode;
      clickSoundBufferRef.current = clickSoundBuffer;
      console.log("init()完了");
      console.log("init()の戻り値があるか", audioContext, clickSoundBuffer);

      // アナライザー初期化
      if (audioContext && mediaStreamSource) {
        initializeAnalyzer(audioContext, mediaStreamSource);
        console.log("アナライザー初期化完了");
      }

      // カウントイン初期化
      countInInitialize(clickSoundBuffer);
      //メトロノーム初期化
      metronomeInitialize(audioContext, clickSoundBuffer);

      setIsInitialized(true);
      console.log("RecordingCoreの初期化完了");
    }catch (e) {
      console.error("録音初期化に失敗しました", e);
    }finally{
      setIsInitializing(false);
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



    //初期化処理
    const safeInitialize = async () => {
      await initializeRecording();
    };
    safeInitialize();


    // クリーンアップ処理
    return () => {
      console.log(`RecordingCoreがアンマウントされました[${new Date().toISOString()}]`);
      console.log("RecordingCore: クリーンアップ開始");
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.port.postMessage({ type: "stop" });
        audioWorkletNodeRef.current.disconnect();
        audioWorkletNodeRef.current = null;
        console.log("AudioWorkletNode をクリーンアップしました", audioWorkletNodeRef.current);
      }
      if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
        console.log("MediaStreamSource をクリーンアップしました", mediaStreamSourceRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().then(() => {
          audioContextRef.current = null;
          console.log("AudioContext を閉じました",audioContextRef.current);
        });
      }
      setIsRecording(false);
      cleanupAnalyzer(); // アナライザーのクリーンアップ
      stopMetronome(); //メトロノームのクリーンアップ
      setIsInitialized(false); // 初期化状態をfalseに
      setIsInitializing(false);
      console.log("RecordingCore: クリーンアップ完了");
    };
  }, []);

  // 録音開始処理
  const handleStartRecording = async () => {
    //初期化未済の場合、初期化
    if (!isInitialized) {
      console.log("初期化が未完了のため、初期化を実行します");
      await initializeRecording();
    }

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
  const handleStopRecording = () => {
    stop();
    stopMetronome();
    setIsRecording(false);
    cleanupAnalyzer(mediaStreamSourceRef.current);
    console.log("stop()発動");
  };

  // 録音中・カウントイン中で共通の録音開始フロー
  const startRecording = () => {
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

  //残り時間表示
  useEffect(() => {
    let timerId;
    if (isRecording) {
      timerId = setInterval(() => {
        setRemainingTime((prev) => Math.max(prev - 0.1, 0)); // 0.1秒単位で更新
      }, 100); // 1秒ごと
    } else {
      clearInterval(timerId);
    }
    return () => clearInterval(timerId); // クリーンアップ
  }, [isRecording]);

   // 分:秒形式に変換
  const formatRemainingTime = () => {
    const minutes = Math.floor(remainingTime / 60); // 分を計算
    const seconds = (remainingTime % 60).toFixed(1); // 秒（小数点1桁）
    return `${minutes}:${seconds.padStart(4, "0")}`; // "分:秒.0"の形式
  };

  return(
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      mt:2,
      pb:10,
      gap:5
      }}>
        <Box sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          {/* <Button variant="secondary" startIcon={<SettingsIcon />}>マイク選択</Button> */}
        </Box>
        {isRecording &&<Typography variant="h6">{formatRemainingTime()}</Typography>}
        {isRecording && <AnalyzerVisualization analyzerData={analyzerData} duration={settings.duration} />}
        <IconButton onClick={isRecording ? handleStopRecording : handleStartRecording} sx={{ color:"red", pl: 0 }}>
                {!isRecording ? <RadioButtonCheckedIcon sx={{fontSize: "8rem"}}/> : <StopCircleIcon sx={{fontSize: "8rem"}}/>}
        </IconButton>
    </Box>
  );
};