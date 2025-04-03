import { AudioBuffer, SetState } from "@sharedTypes/types";
import { useState, useRef } from "react";

export function useAudioPlayer({
  audioBuffer,
  audioContext,
  gainNode,
  id,
  enablePostAudioPreview,
  isPlaybackTriggered,
  setIsPlaybackTriggered,
  playbackTriggeredByRef
} : {
  audioBuffer: AudioBuffer;
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
  id?: string;
  enablePostAudioPreview?: boolean;
  isPlaybackTriggered: boolean;
  setIsPlaybackTriggered: SetState<boolean>;
  playbackTriggeredByRef: React.MutableRefObject<string | null>;
}) {
  const isPlayingRef = useRef<boolean>(false); //再生状態管理（クロージャー回避も考慮・・・onened内をstateにすると初期値で固定化される）
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const intervalIdRef = useRef<number | null>(null);
  const ignoreOnEndedForPauseRef = useRef<boolean>(false);


  // 各操作に対応してノード初期化を行う関数
  const createSourceNode = (): AudioBufferSourceNode | null => {
    if (audioContext && audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      if (gainNode){
        source.connect(gainNode);
      } else {
        source.connect(audioContext.destination);
      }

      //AudioBufferSourceNodeのendイベントハンドラ（初期化）
      source.onended = () => {
        // pause時のstopに対しては無視
        if (ignoreOnEndedForPauseRef.current) {
          ignoreOnEndedForPauseRef.current = false;
          return;
        }

        if (isPlayingRef.current) {
          stopInterval();
          resetCoreLogic();

          // 再生指示フラグのリセット
          if (enablePostAudioPreview && id) {
            setIsPlaybackTriggered(false);
            playbackTriggeredByRef.current = null;
          }

        }
      };
      return source;
    }
    return null;
  };

  //初期化
  const init = (): void => {
    if (audioContext && audioBuffer) {
      setDuration(audioBuffer.duration);
    } else {
      console.error(`[id:${id}!]useAudioPlayerの初期化に失敗しました`);
    }
  };

  //録音時同時再生時の位置初期化
  const resetPlaybackState = (): void => {
    ignoreOnEndedForPauseRef.current = true;
    stopInterval();
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    resetCoreLogic();
  };

  //reset処理共通化
  const resetCoreLogic = (): void => {
    setCurrentTime(0);
    startTimeRef.current = 0;
    pausedAtRef.current = 0;
    sourceNodeRef.current = null;
    isPlayingRef.current = false;
    setIsPlaying(false);
  };

  // タイマー停止処理の共通化
  const stopInterval = (): void => {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };


  //再生
  const play = (): void => {
    if (audioContext) {
      ignoreOnEndedForPauseRef.current = false;

      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }

      const source = createSourceNode();

      if (source) {
        sourceNodeRef.current = source;
        const playbackStart = pausedAtRef.current || currentTime;

        isPlayingRef.current = true;
        setIsPlaying(true);

        startTimeRef.current = audioContext.currentTime - playbackStart;

        source.start(0, playbackStart); // 現在の再生位置から再生（第一引数は再生までの延滞時間）
        startTimeRef.current = audioContext.currentTime - currentTime;

         // 0.1秒ごとに再生位置を更新
        intervalIdRef.current = window.setInterval(() => {
          const elapsed = audioContext.currentTime - startTimeRef.current;
          setCurrentTime(Math.min(elapsed, duration));
        }, 100); //setIntervalはこのタイマーの識別IDを返却
      }else {
        console.error(`[id:${id}] 再生に必要なsourceNodeの生成に失敗しました`);
      }
    }else {
      console.error(`[id:${id}] AudioContextが無効です`);
    }
  };

  //一時停止
  const pause = (): void => {
    if (audioContext && sourceNodeRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      ignoreOnEndedForPauseRef.current = true;

      pausedAtRef.current = audioContext.currentTime - startTimeRef.current;
      sourceNodeRef.current.stop();
      stopInterval();
    }
  };

  const seek = (time: number): void => {
    if (audioContext) {
      if (isPlayingRef.current) {
        pause();

        if (enablePostAudioPreview && id) {
          setIsPlaybackTriggered(false);
        }
      }
      pausedAtRef.current = time;
      setCurrentTime(time);
    }
  };

  //IDの異なるAudioPlayerの再生位置変更を自身の位置に適用する専用関数
  const syncPosition = (time: number): void => {
    if (audioContext) {
      pausedAtRef.current = time;
      setCurrentTime(time);
    }
  };


  const cleanup = (): void => {
    stopInterval();
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    resetCoreLogic();
    if (enablePostAudioPreview && id) {
      setIsPlaybackTriggered(false);
      playbackTriggeredByRef.current = null;
    }
  };

  return {
    isPlayingRef: isPlayingRef,
    setIsPlaying,
    currentTime,
    duration,
    init,
    resetPlaybackState,
    play,
    pause,
    seek,
    syncPosition,
    cleanup
  };
}
