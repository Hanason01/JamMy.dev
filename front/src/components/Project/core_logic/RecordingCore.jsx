"use client";

import { useState, useEffect } from "react";
import { Button, Box, IconButton, Typography } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { useAudioRecorder } from "../../../hooks/audio/useAudioRecorder";
import { useAudioAnalyzer } from "../../../hooks/audio/useAudioAnalyzer";
import { AnalyzerVisualization } from "./AnalyzerVisualization"

export function RecordingCore({ onRecordingComplete}){
  const [ isRecording, setIsRecording ] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { init, start, stop, audioBuffer, audioContext, mediaStreamSource } = useAudioRecorder();

  //録音フィードバック関連
  const [elapsedTime, setElapsedTime] = useState(0.0);
  const { analyzerData } = useAudioAnalyzer(audioContext, mediaStreamSource);

  //録音初期化→開始・停止
  const handleRecording = async() => {
    if(isRecording){
      stop();
      console.log("stop()発動");
      setIsRecording(false);
      setElapsedTime(0);
    }else{
      if(!isInitialized) {
        try{
          await init();
          setIsInitialized(true);
          console.log("init()完了");
        } catch(error){
          console.error("録音初期化エラー", error);
          return;
        }
      }
      start();
      console.log("start()発動");
      setIsRecording(true);
    }
  };

  //録音停止をフックに生成されるaudioBufferを親へ渡す(audioBufferは停止時一度のみ生成)
  useEffect(() => {
    if (audioBuffer) {
      onRecordingComplete(audioBuffer);
      console.log("親へバッファーを渡す",audioBuffer);
    }
  }, [audioBuffer]);

  //経過時間表示
  useEffect(() => {
    let timerId;
    if (isRecording) {
      timerId = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1); // 0.1秒単位で更新
      }, 100); // 1秒ごと
    } else {
      clearInterval(timerId);
    }
    return () => clearInterval(timerId); // クリーンアップ
  }, [isRecording]);

   // 分:秒形式に変換
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60); // 分を計算
    const seconds = (elapsedTime % 60).toFixed(1); // 秒（小数点1桁）
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
          <Button variant="secondary" startIcon={<SettingsIcon />}>マイク選択</Button>
        </Box>
        {isRecording &&<Typography variant="h6">{formatElapsedTime()}</Typography>}
        {isRecording && <AnalyzerVisualization analyzerData={analyzerData} />}
        <IconButton onClick={handleRecording} sx={{ color:"red", pl: 0 }}>
                {!isRecording ? <RadioButtonCheckedIcon sx={{fontSize: "8rem"}}/> : <StopCircleIcon sx={{fontSize: "8rem"}}/>}
        </IconButton>
    </Box>
  );
};