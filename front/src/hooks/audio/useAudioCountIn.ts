"use client";

import { AudioBuffer } from "@sharedTypes/types";
import { useState, useRef } from "react";

export function useAudioCountIn() {
  const [isCountingIn, setIsCountingIn] = useState<boolean>(false);
  const countRef = useRef<number>(0); // 現在のカウント数
  const countInAudioContextRef = useRef<AudioContext | null>(null); //countIn専用Context
  const clickSoundBufferRef = useRef<AudioBuffer | null>(null);

  const countInInitialize = (clickSoundBuffer: AudioBuffer): void => {
    console.log("countInInitializeが受け取ったBuffer", clickSoundBuffer);
    const countInAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    countInAudioContextRef.current = countInAudioContext;
    clickSoundBufferRef.current = clickSoundBuffer;
    console.log("useAudioCountInが初期化されました:contextRefとクリック音のRef", countInAudioContextRef.current,clickSoundBufferRef.current);
  };

  const playClick = (): void => {
    console.log("playClick発動");
    try {
      if (!countInAudioContextRef.current || !clickSoundBufferRef.current) {
        throw new Error("countInAudioContextRef または clickSoundBufferRef が未定義です");
      }
      const source = countInAudioContextRef.current.createBufferSource();
      console.log("playClick時のcountInAudioContext状態:", countInAudioContextRef.current?.state); // audioContextの状態確認
      source.buffer = clickSoundBufferRef.current;
      source.connect(countInAudioContextRef.current.destination);
      source.start();
      console.log("クリック音再生成功");
    } catch (error) {
      console.error("クリック音再生エラー", error);
    }
  };

  const startCountIn = (settings: { countIn: number; tempo: number }, onComplete: () => void) => {
    console.log("カウントインのstartCountIn発動");
    console.log("受け取った設定:", settings);

    if (!countInAudioContextRef.current || !clickSoundBufferRef.current) {
      console.error("countInAudioContextかクリック音データがありません");
      return;
    }

    const { countIn: count, tempo } = settings;

    if (count <= 0) {
      onComplete(); // カウントインが不要の場合すぐに終了
      console.log("カウントイン不要（カウントが0以下）");
      return;
    }

    setIsCountingIn(true);
    countRef.current = 0; // カウントをリセット
    console.log(`カウントイン開始: count=${count}, tempo=${tempo}`);
    const interval = 60 / tempo ; // BPM に基づく間隔
    const startTime = countInAudioContextRef.current.currentTime; // カウントインの基準時間

    const scheduleClick = (currentCount: number): void => {
      if (currentCount >= count) {
        // 必要な回数が完了したら録音開始
        console.log("カウントイン終了");
        setIsCountingIn(false);
          // countInAudioContext をクローズ（カウントイン専用の為）
        if (countInAudioContextRef.current)
          countInAudioContextRef.current.close().then(() => {
            console.log("countInAudioContext がCloseされました",countInAudioContextRef.current);
            onComplete(); // 録音開始コールバック
        });
        return;
      }

      const clickTime = startTime + currentCount * interval; // 現在のクリック音のタイミング
      playClick(); // クリック音を再生

      console.log(`カウントイン中: count=${currentCount + 1}, time=${clickTime}`);

      // 次のクリックをスケジュール
      countRef.current = currentCount + 1;
      setTimeout(() => scheduleClick(countRef.current), interval * 1000);
    };

    // 最初のクリックをスケジュール
    scheduleClick(countRef.current);
  };

  return { isCountingIn, startCountIn, countInInitialize };
}
