"use client";

import { AudioBuffer, Settings, SetState } from "@sharedTypes/types";
import { useState, useEffect, useRef } from "react";
import { Button, Box, IconButton, Typography, CircularProgress, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, Divider } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { keyframes } from "@emotion/react";
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
  enablePostAudio = false,
  isRecording,
  setIsRecording,

} : {
  id?: string;
  globalAudioContext?: AudioContext | null;
  onRecordingComplete: (audioBuffer: AudioBuffer) => void;
  settings: Settings;
  enablePostAudio?: boolean;
  isRecording: boolean;
  setIsRecording: SetState<boolean>;
}){
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [initializedDeviceId, setInitializedDeviceId] = useState<string | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  //WebAudioApi関連
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const clickSoundBufferRef = useRef<AudioBuffer | null>(null);

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
    setInitializedDeviceId,
    cleanupAnalyzer,
    stopMetronome,
    setIsPlaybackTriggered,
    playbackTriggeredByRef,
    enablePostAudio,
    id
  });

  //録音フィードバック関連
  const [remainingTime, setRemainingTime] = useState<number>(settings.duration ?? 30);

  //初期化関数
  const initializeRecording = async (isMounted: () => boolean): Promise<void> => {
    if (isInitialized || isInitializing || !isMounted()){
      return;
    }
    setIsInitializing(true);
    try {
      if (!isMounted()) return;
      const initResult = await init(isMounted, selectedDeviceId);
      if (!initResult) {
        console.warn("init() が中断されました。初期化処理を中止します。");
        return;
      }

      const { audioContext, mediaStreamSource, audioWorkletNode, clickSoundBuffer } = initResult;

      if (!isMounted()) return;
      audioContextRef.current = audioContext;
      mediaStreamSourceRef.current = mediaStreamSource;
      audioWorkletNodeRef.current = audioWorkletNode;
      clickSoundBufferRef.current = clickSoundBuffer;

      if (audioContext && mediaStreamSource && isMounted()) {
        initializeAnalyzer(audioContext, mediaStreamSource);
      }

      if(isMounted())countInInitialize(clickSoundBuffer);
      if(isMounted())metronomeInitialize(audioContext, clickSoundBuffer);

      if(isMounted()){
        setIsInitialized(true);
      }
    }catch (e) {
      console.error("録音初期化に失敗しました", e);
    }finally{
      if(isMounted())setIsInitializing(false);
    }
  };

  //初期化リセット関数
  const resetInitialization = () => {
    cleanupAnalyzer(mediaStreamSourceRef.current);
    cleanupRecording();
    stopMetronome();
    setIsRecording(false);
    setIsInitialized(false);
    setIsInitializing(false);
    if (enablePostAudio && id) {
      playbackTriggeredByRef.current=null;
    }
  };

  //初期化
  useEffect(() => {
    let isMounted = true;
    initializeRecording(() => isMounted);

    return () => {
      isMounted = false;
      resetInitialization();
    };
  }, [selectedDeviceId]);


  //マイク選択処理
  const handleMicSelect = async (deviceId: string) => {
    setMenuAnchor(null);
    resetInitialization();
    setSelectedDeviceId(deviceId);
  };


  // 録音開始処理
  const handleStartRecording = async (): Promise<void> => {
    setIsPressed(true);
    if (settings.countIn > 0) {
      startCountIn(settings, () => {
        startRecording();
      });
    } else {
      startRecording();
    }
  };


  // 録音中・カウントイン中で共通の録音開始フロー
  const startRecording = (): void => {
    setRemainingTime(settings.duration || 0);
    setIsRecording(true);
    start();

      if (enablePostAudio && id) {
      playbackTriggeredByRef.current=id;
      setIsPlaybackTriggered(true);
    }

    if (settings.metronomeOn) {
      startMetronome(settings.tempo);
    }
  };


  // 録音停止処理
  const handleStopRecording = async(): Promise<void> => {
    setLoading(true);
    setIsRecording(false);
    stop();
  };


  //録音停止をフックに生成されるaudioBufferを親へ渡す(audioBufferは停止時一度のみ生成)
  useEffect(() => {
    if (audioBuffer) {
      onRecordingComplete(audioBuffer);
    }
    if(enablePostAudio) {
      setIsPlaybackReset(true);
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
        setRemainingTime((prev) => Math.max(prev - 0.1, 0));
      }, 100);
    } else {
      clearInterval(timerId);
    }

    return () => clearInterval(timerId);
  }, [isRecording]);


   // 分:秒形式に変換
  const formatRemainingTime = (): string => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = (remainingTime % 60).toFixed(1); // 秒（小数点1桁）
    return `${minutes}:${seconds.padStart(4, "0")}`; // "分:秒.0"の形式
  };


  //録音ボタンアニメーション
  const shrinkToSquare = keyframes`
    0% {
      border-radius: 50%;
      width: 5rem;
      height: 5rem;
    }
    100% {
      border-radius: 10%;
      width: 3rem;
      height: 3rem;
    }
  `;


    const fadeIn = keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `;

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
          alignItems: "center",
          justifyContent: "flex-end",
        }}>
          <HelpOutlineIcon onClick={() => {setOpenDialog(true)}} sx={{mr:3, width:"30px", height: "30px", color: "secondary.main"}} />
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle >
              <Box display="flex" alignItems="center" justifyContent="center">
                録音のポイント
                <TipsAndUpdatesIcon sx={{color: "secondary.main"}} />
              </ Box>
            </DialogTitle>

            <Divider />
            <DialogContent>
              <DialogContentText>
              1. できるだけ雑音の少ない静かな環境で録音しましょう！<br />
              2. メトロノームを聞きながら、または投稿の音声を聞きながら録音する際は、できるだけイヤホン・ヘッドホンを利用しましょう！<br />
              <br />
              ※お使いのイヤホンのマイク性能や接続方式（BlueTooth等）によっては、録音音声に遅延が発生することがあります。<br />
              ※スマートフォンでは、マイク付きヘッドホン・イヤホンを利用される場合、ほとんどのケースでマイク選択により音声出力もセットでご指定のデバイスになります。完全に分離して録音したい場合は、PCでのご利用を推奨します。
              <br />
              <span style={{color:"#e53935"}}>※イヤホンをつけた状態でも、マイク設定を本体のマイクに変更すると、本体から音声が出力される事がありますので、ご注意ください！</span>
              </DialogContentText>
            </DialogContent>
          </Dialog>
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
              selected={(mic.deviceId === selectedDeviceId) || (mic.deviceId ===initializedDeviceId)}
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
            alignItems: "center",
            width: "100%",
            }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 12px",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "2.2rem",
                letterSpacing: "1.5px",
                animation: `${fadeIn} 0.3s ease-in-out`,
                minWidth: "120px",
                textAlign: "center",
                color: "primary.dark",
                backdropFilter: "blur(6px)",
              }}
            >
              {formatRemainingTime()}
            </Box>
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
          <Box
            sx={{
              width: "6rem",
              height: "6rem",
              borderRadius: "50%",
              border: "4px solid #e53935",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isInitializing ? 0.5 : 1,
              pointerEvents: isInitializing ? "none" : "auto",
            }}
          >
            <Box
              sx={{
                width: "5rem",
                height: "5rem",
                borderRadius: "50%",
                backgroundColor: "#e53935",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease-in-out",
                animation: isPressed || isRecording ? `${shrinkToSquare} 0.3s ease-in-out forwards` : "none",
              }}
              onClick={!isRecording ? handleStartRecording : handleStopRecording}
            />
          </Box>
          )}
        </Box>
    </Box>
  );
};