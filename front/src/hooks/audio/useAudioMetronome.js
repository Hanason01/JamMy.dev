"use client";

import { useRef } from "react";

export function useAudioMetronome() {
  const isPlayingRef = useRef(false);
  const nextClickTimeRef = useRef(0); //個々のクリック音をcontextのcurrentIme上にマッピングする座標
  const audioContextRef = useRef(null); // AudioContext を保持
  const clickSoundBufferRef = useRef(null); // clickSoundBuffer を保持

  // 初期化関数
  const metronomeInitialize = (audioContext, clickSoundBuffer) => {
    console.log("metronomeInitializeが受け取ったBuffer", clickSoundBuffer);
    audioContextRef.current = audioContext;
    clickSoundBufferRef.current = clickSoundBuffer;
    // console.log("useAudioMetronomeが初期化されました", {
    //   audioContext: audioContextRef.current,
    //   clickSoundBuffer: clickSoundBufferRef.current,
    // });
  };

  // クリック音を再生
  const playClick = (time) => {
    try {
      // console.log(`playClickが呼び出されました: time=${time}`);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = clickSoundBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.start(time); //timeはcontext.currentTime上の再生座標
      // console.log(`クリック音を再生しました: time=${time}`);
    } catch (error) {
      console.error("クリック音再生エラー", error);
    }
  };

  // メトロノーム開始
  const startMetronome = (tempo) => {
    if (!audioContextRef.current || !clickSoundBufferRef.current) {
      console.error("AudioContext またはクリック音データが未初期化です");
      return;
    }
    // console.log("startMetronomeが呼び出されました");
    // console.log("受け取ったtempo:", tempo);
    // console.log("現在のaudioContext:", audioContextRef.current);
    // console.log("現在のclickSoundBuffer:", clickSoundBufferRef.current);

    isPlayingRef.current = true; //開始フラグ
    nextClickTimeRef.current = audioContextRef.current.currentTime; // AudioContext の現在時間を基準にする
    const interval = 60 / tempo; // BPM に基づく間隔
    const scheduleClicks = () => {
      // console.log("scheduleClicksが呼び出されました");
      // console.log("現在のaudioContextのcurrentTime:", audioContextRef.current.currentTime);
      // console.log("nextClickTimeRef.current:", nextClickTimeRef.current);
      while (
        isPlayingRef.current &&
        nextClickTimeRef.current < audioContextRef.current.currentTime + 0.1
      ) {
        // console.log("クリック音をスケジュール:", nextClickTimeRef.current);
        playClick(nextClickTimeRef.current);
        nextClickTimeRef.current += interval;
      }

      if (isPlayingRef.current) {
        // console.log("次のスケジュール呼び出しをセット");
        setTimeout(scheduleClicks, 25); // 定期的にクリックをスケジュール
      }
    };

    console.log(`メトロノーム開始: tempo=${tempo}, interval=${interval}`);
    scheduleClicks();
  };

  // メトロノーム停止
  const stopMetronome = () => {
    console.log("stopMetronomeが呼び出されました");
    console.log("メトロノーム停止前の状態:", {
    isPlaying: isPlayingRef.current,
    nextClickTime: nextClickTimeRef.current,
    });
    isPlayingRef.current = false;
    console.log("メトロノームが停止しました");
  };

  return { metronomeInitialize, startMetronome, stopMetronome };
}
