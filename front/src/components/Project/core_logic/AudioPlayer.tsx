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
} : {
  id?: string;  //オプショナル
  audioBuffer: AudioBuffer;
  audioContext: AudioContext | null;
  gainNode?: GainNode | null; //オプショナル
  enablePostAudioPreview?: boolean; //オプショナル
}){
// console.log(`[id:${id}!]enablePostAudioPreviewの追跡`,enablePostAudioPreview);

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

  // console.log(`[id:${id}!]isPlayingRef追跡`,isPlayingRef.current);
  // console.log(`[id:${id}!]isPlaybackTriggered追跡`, isPlaybackTriggered);
  // console.log(`[id:${id}!]playbackTriggeredByRef追跡`, playbackTriggeredByRef.current);

  const [isPlayBackReady, setIsPlayBackReady] = useState<boolean>(false); //同時再生準備状態フラグ
  const isFirstRenderRef = useRef(true); //useEffect制御フラグ


  //初期化処理
  useEffect(() => {
    // console.log(`[id:${id}!][${new Date().toISOString()}] AudioPlayerがマウントされました`);
    if (audioBuffer && audioContext){
      // console.log(`[id:${id}!]AudioPlayer.jsxでinit()発動`);
      // console.log(`[id:${id}!]この時点のaudioBufferとcontext`, audioBuffer, audioContext);
      init();

    } else{
      // console.log(`[id:${id}!]audioBufferとaudioContextが両方存在しない為、AudioPlayer.jsxのuseEffectが失敗しました`);
    }
    return () => {
      cleanup();
      setIsPlaybackTriggered(false);
      playbackTriggeredByRef.current=null;
      setSharedCurrentTime(0);
      currentTimeUpdatedByRef.current=null;
      // console.log(`[id:${id}!]AudioPlayerがアンマウントされました[${new Date().toISOString()}]`);
    };
  }, []);

  //タブが非アクティブになった場合
  useEffect(() => {
    if(!audioContext) return;

    const handleVisibilityChange = async () =>{
      if(document.hidden && isPlayingRef.current){ //タブを離れた場合かつ再生中の場合のみ
        await handlePlayPause(); //停止ボタン処理
      } else if(!document.hidden){ //戻ってきた場合
        resetPlaybackState();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return() =>{
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  },[])


  // 音声間の再生・停止指示リスナー、停止制御
  useEffect(() => {
    // 初回レンダリングの場合はスキップ
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

   // 録音 ー 投稿音声間の処理
    if (playbackTriggeredByRef.current=== "Recording" && id) {
      if (isPlaybackTriggered) {
        // console.log(`[id:${id}!]録音開始に伴い、音声をリセットして再生を開始します`);
        resetPlaybackState(); // 再生位置をリセット
        setIsPlayBackReady(true);
      } else {
        // console.log(`[id:${id}!]録音停止に伴い、音声を停止します`);
        resetPlaybackState(); // 再生位置をリセット
      }

  //異なるIDのAudioPlayer間
    } else if (playbackTriggeredByRef.current && id && playbackTriggeredByRef.current !== id){
      // console.log(`[id:${id}!]別のコンポーネントから再生・停止指示を受けました`, id, playbackTriggeredByRef.current);
      if (isPlaybackTriggered) {
        // console.log(`[id:${id}!]isPlaybackTriggeredがtrueになったので再生準備をします`);
        setIsPlayBackReady(true);
      } else {
        // console.log(`[id:${id}!]isPlaybackTriggeredがfalseになったので再生を停止しリセットします`);
        pause();
        setIsPlayBackReady(false);
      }
  //自分自身の指示の場合
    } else {
      // console.log(`[id:${id}!]自身の出した指示によりuseEffectが発動した為、returnします`, id, playbackTriggeredByRef.current);
    }
  }, [isPlaybackTriggered]);


  // 録音 ー 投稿音声間の再生制御
  useEffect(() => {
    if (isPlayBackReady) {
      // console.log(`[id:${id}!]再生準備が行われ、isPlayBackReady=trueになったので再生を開始します`);
      play();
    }
    setIsPlayBackReady(false);
  }, [isPlayBackReady]);

  // 録音 ー 投稿音声間のリセット制御
  useEffect(() => {
    if (isPlaybackReset && playbackResetTriggeredByRef.current !==id) {
      // console.log(`[id:${id}!]同時再生時のプレイヤーがリセット要請されました`);
      cleanup();
      setIsPlaybackReset(false)
      playbackResetTriggeredByRef.current = null;
    }
  }, [isPlaybackReset]);


  // AudioPlayer→異なるIDのAudioPlayerへの再生位置送信
  useEffect(() => {
    // 初回レンダー時は同期処理をスキップ
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false; // フラグを更新
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
      // console.log(`[id:${id}!]別のコンポーネントから再生位置を同期します`, sharedCurrentTime);
      syncPosition(sharedCurrentTime); // 再生位置を共有された位置に設定
    }
  }, [sharedCurrentTime]);


    // ボタンのクリックで再生・停止を指示する
  const handlePlayPause = async () => {
    // 応募管理の場合、contextがsuspendであればresumeさせる
    if (audioContext && audioContext.state !== "running") {
      await audioContext.resume();
    }

    if (isPlayingRef.current) {
      if(enablePostAudioPreview && id){
       // 停止指示
        playbackTriggeredByRef.current = id; // 指示元を記録
        setIsPlaybackTriggered(false); // 停止を通知
        // console.log(`[id:${id}!] が停止指示を出しました`);
      }
      pause();
    } else {
      if(enablePostAudioPreview && id){
       // 再生指示
        playbackTriggeredByRef.current = id; // 指示元を記録
        setIsPlaybackTriggered(true); // 再生を通知
        // console.log(`[${id}] が再生指示を出しました`);
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