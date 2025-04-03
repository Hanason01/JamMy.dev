"use client";

import { AudioBuffer, SetState } from "@sharedTypes/types";
import { useState, useRef, useEffect } from "react";
import { Box, IconButton, Typography, Slider } from "@mui/material";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import { useAudioPlayer } from "@audio/useAudioPlayer";
import { usePlayback } from "@context/usePlayBackContext";

export function AudioPlayer({
  id,
  audioBuffer,
  audioContext,
  gainNode,
  enablePostAudioPreview = false,
  playFlagFromIndex,
  setPlayFlagFromIndex,
  resetFlagFromIndex,
  setResetFlagFromIndex,
} : {
  id?: string;
  audioBuffer: AudioBuffer;
  audioContext: AudioContext | null;
  gainNode?: GainNode | null;
  enablePostAudioPreview?: boolean;
  playFlagFromIndex?: boolean;
  setPlayFlagFromIndex?: SetState<boolean>;
  resetFlagFromIndex?: boolean;
  setResetFlagFromIndex?: SetState<boolean>;
}){

  //同時再生Context
  const {
    isPlaybackTriggered,
    setIsPlaybackTriggered,
    playbackTriggeredByRef,
    sharedCurrentTime,
    setSharedCurrentTime,
    currentTimeUpdatedByRef,
    isPlaybackReset,
    setIsPlaybackReset,
    playbackResetTriggeredByRef
  } = usePlayback();

  const {
    isPlayingRef,
    setIsPlaying,
    init,
    resetPlaybackState,
    play,
    pause,
    seek,
    syncPosition,
    cleanup,
    currentTime,
    duration
  } = useAudioPlayer({
    audioBuffer,
    audioContext,
    gainNode:gainNode ?? null,
    id,
    enablePostAudioPreview,
    isPlaybackTriggered,
    setIsPlaybackTriggered,
    playbackTriggeredByRef
  });

  const [isPlayBackReady, setIsPlayBackReady] = useState<boolean>(false);
  const isFirstRenderRef = useRef(true);


  //初期化処理
  useEffect(() => {
    if (audioBuffer && audioContext){
      init();

    } else{
      console.error("音声データおよびContextが正常に取得できませんでした");
    }
    return () => {
      cleanup();
      setIsPlaybackTriggered(false);
      playbackTriggeredByRef.current=null;
      setSharedCurrentTime(0);
      currentTimeUpdatedByRef.current=null;
    };
  }, []);

  //タブが非アクティブになった場合
  useEffect(() => {
    if(!audioContext) return;

    const handleVisibilityChange = async () =>{
      if(document.hidden && isPlayingRef.current){
        await handlePlayPause();
      } else if(!document.hidden){
        resetPlaybackState();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return() =>{
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  },[])

  //Indexからの再生指示リスナー（初回再生）
  useEffect(() =>{
    if(!playFlagFromIndex || duration === 0) return;

    play();
    setPlayFlagFromIndex?.(false);
  },[playFlagFromIndex, duration]);


  //Indexからのリセット指示リスナー
  useEffect(() =>{
    if(!resetFlagFromIndex) return;

    resetPlaybackState();
    setResetFlagFromIndex?.(false);
    setPlayFlagFromIndex?.(true);
  },[resetFlagFromIndex]);


  // 音声間の再生・停止指示リスナー、停止制御
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

   // 録音 ー 投稿音声間の処理
    if (playbackTriggeredByRef.current=== "Recording" && id) {
      if (isPlaybackTriggered) {
        resetPlaybackState();
        setIsPlayBackReady(true);
      } else {
        resetPlaybackState();
      }

  //異なるIDのAudioPlayer間
    } else if (playbackTriggeredByRef.current && id && playbackTriggeredByRef.current !== id){
      if (isPlaybackTriggered) {
        setIsPlayBackReady(true);
      } else {
        pause();
        setIsPlayBackReady(false);
      }
  //自分自身の指示の場合
    } else {
      return;
    }
  }, [isPlaybackTriggered]);


  // 録音 ー 投稿音声間の再生制御
  useEffect(() => {
    if (isPlayBackReady) {
      play();
    }
    setIsPlayBackReady(false);
  }, [isPlayBackReady]);


  // 録音 ー 投稿音声間のリセット制御
  useEffect(() => {
    if (isPlaybackReset && playbackResetTriggeredByRef.current !==id) {
      cleanup();
      setIsPlaybackReset(false)
      playbackResetTriggeredByRef.current = null;
    }
  }, [isPlaybackReset]);


  // AudioPlayer→異なるIDのAudioPlayerへの再生位置送信
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (enablePostAudioPreview && id) {
      setSharedCurrentTime(currentTime);
      currentTimeUpdatedByRef.current=id;
    }
    return () => {
      currentTimeUpdatedByRef.current=null;
    }
  }, [currentTime]);


  // 異なるIDのAudioPlayerからの再生位置受信
  useEffect(() => {
    if (
      !isFirstRenderRef.current &&
      currentTimeUpdatedByRef.current &&
      id &&
      currentTimeUpdatedByRef.current !== id
    ) {
      syncPosition(sharedCurrentTime);
    }
  }, [sharedCurrentTime]);


    // ボタンのクリックで再生・停止を指示する
  const handlePlayPause = async () => {
    if (audioContext && audioContext.state !== "running") {
      await audioContext.resume();
    }

    if (isPlayingRef.current) {
      if(enablePostAudioPreview && id){
       // 停止指示
        playbackTriggeredByRef.current = id;
        setIsPlaybackTriggered(false);
      }
      pause();
    } else {
      if(enablePostAudioPreview && id){
       // 再生指示
        playbackTriggeredByRef.current = id;
        setIsPlaybackTriggered(true);
      }
      play();
    }
  };

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
        onChange={
          (e:Event,value: number | number[]) => seek(typeof value === "number" ? value : value[0] || 0)
        }
        onClick={(e) =>{ e.stopPropagation(); }}
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
          <IconButton sx={{ p: 0 }} onClick={handlePlayPause}>
            {isPlayingRef.current ? (
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