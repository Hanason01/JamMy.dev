"use client";

import { AudioBuffer } from "@sharedTypes/types";
import { useRef } from "react";

export function useAudioMetronome() {
  const isPlayingRef = useRef<boolean>(false);
  const nextClickTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const clickSoundBufferRef = useRef<AudioBuffer | null>(null);

  // 初期化関数
  const metronomeInitialize = (audioContext: AudioContext | null, clickSoundBuffer: AudioBuffer | null): void => {
    audioContextRef.current = audioContext;
    clickSoundBufferRef.current = clickSoundBuffer;
  };

  // クリック音を再生
  const playClick = (time: number): void => {
    try {
      if (!audioContextRef.current || !clickSoundBufferRef.current) {
        throw new Error("AudioContext または clickSoundBuffer が未初期化です");
      }
      const source = audioContextRef.current.createBufferSource();
      source.buffer = clickSoundBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.start(time);
    } catch (error) {
      console.error("クリック音再生エラー", error);
    }
  };

  // メトロノーム開始
  const startMetronome = (tempo: number): void => {
    if (!audioContextRef.current || !clickSoundBufferRef.current) {
      console.error("AudioContext またはクリック音データが未初期化です");
      return;
    }

    isPlayingRef.current = true;
    nextClickTimeRef.current = audioContextRef.current.currentTime;
    const interval = 60 / tempo;
    const scheduleClicks = (): void => {
      while (
        isPlayingRef.current &&
        nextClickTimeRef.current < audioContextRef.current!.currentTime + 0.1
      ) {
        playClick(nextClickTimeRef.current);
        nextClickTimeRef.current += interval;
      }

      if (isPlayingRef.current) {
        setTimeout(scheduleClicks, 25);
      }
    };

    scheduleClicks();
  };

  // メトロノーム停止
  const stopMetronome = () => {
    isPlayingRef.current = false;
  };

  return { metronomeInitialize, startMetronome, stopMetronome };
}
