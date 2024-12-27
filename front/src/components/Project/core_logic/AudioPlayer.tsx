"use client";

import { AudioBuffer } from "@sharedTypes/types";
import { useEffect } from "react";
import { Box, IconButton, Typography, Slider } from "@mui/material";
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { useAudioPlayer } from "@audio/useAudioPlayer";

export function AudioPlayer({
  audioBuffer,
  audioContext,
  gainNode,
} : {
  audioBuffer: AudioBuffer;
  audioContext: AudioContext | null;
  gainNode?: GainNode | null; //オプショナル
}){
  const { isPlaying, init, play, pause, seek, cleanup, currentTime, duration } = useAudioPlayer({audioBuffer, audioContext, gainNode: gainNode ?? null});


  //初期化処理
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] AudioPlayerがマウントされました`);
    if (audioBuffer && audioContext){
      console.log("AudioPlayer.jsxでinit()発動");
      console.log("この時点のaudioBufferとcontext", audioBuffer, audioContext);
      init();

    } else{
      console.log("audioBufferとaudioContextが両方存在しない為、AudioPlayer.jsxのuseEffectが失敗しました");
    }
    return () => {
      cleanup();
      console.log(`AudioPlayerがアンマウントされました[${new Date().toISOString()}]`);
    };
  }, []);


  return(
    <Box sx={{
      position: "relative",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center", }}>
      <Slider
        value={currentTime}
        min={0} max={duration}
        onChange={(e:Event,value: number | number[]) => seek(typeof value === "number" ? value : value[0] || 0)}
      />
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
        mb: 1
        }}>
        <Typography color= "textSecondary" sx={{ width: "35px", textAlign: "right",}}>{Math.floor(currentTime)}秒</Typography>
        <Box display= "flex" justifyContent= "center">
          <IconButton sx={{ p: 0 }} onClick={isPlaying ? pause : play} >{isPlaying ? (
            <PauseCircleIcon
              sx={{ width: 60, height: 60, color: "primary.main" }}
            />
          ) : (
            <PlayCircleFilledIcon
              sx={{ width: 60, height: 60, color: "primary.main" }}
            />
          )}</IconButton>
        </Box>
        <Typography color= "textSecondary" sx={{ width: "40px", textAlign: "left",}}>-{Math.max(0, Math.floor(duration - currentTime))}秒</Typography>
      </Box>
    </Box>
  );
};