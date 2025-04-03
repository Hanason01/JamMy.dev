"use client";

import { AudioBuffer } from "@sharedTypes/types";
import { useState, useRef } from "react";

export function useAudioCountIn() {
  const [isCountingIn, setIsCountingIn] = useState<boolean>(false);
  const countRef = useRef<number>(0);
  const countInAudioContextRef = useRef<AudioContext | null>(null);
  const clickSoundBufferRef = useRef<AudioBuffer | null>(null);

  const countInInitialize = (clickSoundBuffer: AudioBuffer): void => {
    const countInAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 44100
    });
    countInAudioContextRef.current = countInAudioContext;
    clickSoundBufferRef.current = clickSoundBuffer;
  };

  const playClick = (): void => {
    try {
      if (!countInAudioContextRef.current || !clickSoundBufferRef.current) {
        throw new Error("countInAudioContextRef または clickSoundBufferRef が未定義です");
      }
      const source = countInAudioContextRef.current.createBufferSource();
      source.buffer = clickSoundBufferRef.current;
      source.connect(countInAudioContextRef.current.destination);
      source.start();
    } catch (error) {
      console.error("クリック音再生エラー", error);
    }
  };

  const startCountIn = (settings: { countIn: number; tempo: number }, onComplete: () => void) => {
    if (!countInAudioContextRef.current || !clickSoundBufferRef.current) {
      console.error("countInAudioContextかクリック音データがありません");
      return;
    }

    const { countIn: count, tempo } = settings;

    if (count <= 0) {
      onComplete();
      return;
    }

    setIsCountingIn(true);
    countRef.current = 0;
    const interval = 60 / tempo ;
    const startTime = countInAudioContextRef.current.currentTime;

    const scheduleClick = (currentCount: number): void => {
      if (currentCount >= count) {
        setIsCountingIn(false);
        if (countInAudioContextRef.current)
          countInAudioContextRef.current.close().then(() => {
            onComplete();
        });
        return;
      }

      const clickTime = startTime + currentCount * interval;
      playClick();

      countRef.current = currentCount + 1;
      setTimeout(() => scheduleClick(countRef.current), interval * 1000);
    };

    scheduleClick(countRef.current);
  };

  return { isCountingIn, startCountIn, countInInitialize };
}
