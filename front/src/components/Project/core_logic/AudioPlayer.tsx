"use client";

import { AudioBuffer, SetState } from "@sharedTypes/types";
import { useEffect } from "react";
import { Box, IconButton, Typography, Slider } from "@mui/material";
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CloseIcon from '@mui/icons-material/Close';
import { useAudioPlayer } from "@audio/useAudioPlayer";

export function AudioPlayer({
  audioBuffer,
  audioContext,
  gainNode,
  setHasRecorded,
  setAudioBufferForProcessing,
  activeStep
} : {
  audioBuffer: AudioBuffer;
  audioContext: AudioContext | null;
  gainNode?: GainNode | null; //オプショナル
  setHasRecorded?: SetState<boolean>; //オプショナル
  setAudioBufferForProcessing?: SetState<AudioBuffer>; //オプショナル
  activeStep: number;
}){
  const { isPlaying, init, play, pause, seek, currentTime, duration } = useAudioPlayer({audioBuffer, audioContext, gainNode: gainNode ?? null});
  // console.log("AudioPlayer.jsxが発動（親から渡されてきた値３つ）", audioBuffer, audioContext, gainNode);

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
      console.log(`AudioPlayerがアンマウントされました[${new Date().toISOString()}]`);
    };
  }, []);

  //閉じるボタン処理
  const handleCloseClick = () => {
    console.log("AudioPlayerを閉じました");
    setHasRecorded?.(false);
    setAudioBufferForProcessing?.(null);
  }

  return(
    <Box sx={{position: "relative", width: "100%", padding: 2}}>
      { activeStep === 0 && (
        <IconButton
          onClick={handleCloseClick}
          sx={{
            position: "absolute",
            top: "0px",
            right: "8px",
            color: "gray",
          }}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
      )}

      <Slider
        value={currentTime}
        min={0} max={duration}
        onChange={(e:Event,value: number | number[]) => seek(typeof value === "number" ? value : value[0] || 0)}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between"}}>
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