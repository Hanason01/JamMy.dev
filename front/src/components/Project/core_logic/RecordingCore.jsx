"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Box, IconButton, Typography, CircularProgress } from "@mui/material";
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
  const [loading, setLoading] = useState(false); // ローディング状態

  //WebAudioApi関連
  const audioContextRef = useRef(null); //メトロノームと共有
  const mediaStreamSourceRef = useRef(null);
  const audioWorkletNodeRef = useRef(null);
  const clickSoundBufferRef = useRef(null); //メトロノームとカウントインに渡す用

  //フック関連
  const { isCountingIn, startCountIn, countInInitialize } = useAudioCountIn( clickSoundBufferRef.current, settings);
  const { metronomeInitialize, startMetronome, stopMetronome } = useAudioMetronome(clickSoundBufferRef.current, settings);
  const { analyzerData, initializeAnalyzer, cleanupAnalyzer } = useAudioAnalyzer();
  const { init, start, stop, audioBuffer } = useAudioRecorder(settings,audioContextRef, audioWorkletNodeRef, setLoading, setIsRecording, cleanupAnalyzer, stopMetronome);

  //録音フィードバック関連
  const [remainingTime, setRemainingTime] = useState(settings.duration ?? 30); // 残り時間（デフォルトは30秒）

  //初期化関数
  const initializeRecording = async (isMounted) => {
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
      // (1)アナライザーのクリーンアップ
      cleanupAnalyzer(mediaStreamSourceRef.current);

      // (2)AudioWorkletNodeのクリーンアップ
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.port.postMessage({ type: "stop" });
        audioWorkletNodeRef.current.disconnect();
        audioWorkletNodeRef.current = null;
        console.log("AudioWorkletNode をクリーンアップしました", audioWorkletNodeRef.current);
      }
      // (3) MediaStreamSourceのクリーンアップ
      if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
        console.log("MediaStreamSource をクリーンアップしました", mediaStreamSourceRef.current);
      }
      // (4) AudioContextのクリーンアップ
      if (audioContextRef.current) {
        // audioContextRef.current.close().then(() => {
          audioContextRef.current = null;
          console.log("AudioContext を閉じました",audioContextRef.current);
        // });
      }
      // (5) 録音中断、メトロノーム停止、初期化状態リセット
      setIsRecording(false);
      stopMetronome();
      setIsInitialized(false);
      setIsInitializing(false);
      console.log("RecordingCore: クリーンアップ完了");
    };
  }, []);

  // 録音開始処理
  const handleStartRecording = async () => {
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
  const handleStopRecording = async() => {
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

  // 残り時間を同期反映する
  useEffect(() => {
    setRemainingTime(settings.duration || 30);
  }, [settings.duration]);

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
            <AnalyzerVisualization analyzerData={analyzerData} duration={settings.duration}/>
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