import { AudioBuffer } from "@sharedTypes/types";
import { useState, useRef } from "react";

export function useAudioPlayer({
  audioBuffer,
  audioContext,
  gainNode
} : {
  audioBuffer: AudioBuffer;
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
}) {
  const isPlayingRef = useRef<boolean>(false); //再生状態
  const [currentTime, setCurrentTime] = useState<number>(0); //スライダー位置
  const [duration, setDuration] = useState<number>(0); //データの総秒数
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null); //WebAudioAPIのcurrentTime
  const startTimeRef = useRef<number>(0); // 再生開始時間を保持
  const intervalIdRef = useRef<number | null>(null); // setInterval のID（currentTimeを更新する頻度の管理）

  // 各操作に対応してノード初期化を行う関数
  const createSourceNode = (): AudioBufferSourceNode | null => {
    if (audioContext && audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      //親で作成されたGainNodeへの接続（Step1限定）
      if (gainNode){
        source.connect(gainNode);
      } else { //Step2の場合
        source.connect(audioContext.destination);
      }

      //AudioBufferSourceNodeのendイベントハンドラ（初期化）
      source.onended = () => {
        if (isPlayingRef.current) {
        isPlayingRef.current = false; //再生状態リセット
          if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current); //スライダー更新停止
            setCurrentTime(0); //再生位置リセット
          }
        }
        console.log("再生が終了しました");
      };
      return source;
    }
    return null;
  };

  //初期化
  const init = (): void => {
    // AudioBufferSourceNode の初期化
    if (audioContext && audioBuffer) {
      setDuration(audioBuffer.duration);
      console.log("useAudioPlayerの初期化に成功");
    } else {
      console.error("useAudioPlayerの初期化に失敗");
    }
  };

  //currentTimeの更新
  const updateCurrentTime = (): void => {
    if (audioContext) {
      const elapsed = audioContext.currentTime - startTimeRef.current;
      setCurrentTime(Math.min(elapsed, duration)); // 再生位置を更新
    }
  };

  //再生
  const play = (): void => {
    if (audioContext) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect(); // 古いノードを切断
      }
      const source = createSourceNode(); // 新しいノードを作成
      if (source) {
        sourceNodeRef.current = source;
        audioContext.resume(); // AudioContextをランタイム状態にする
        source.start(0, currentTime); // 現在の再生位置から再生（第一引数は再生までの延滞時間）
        startTimeRef.current = audioContext.currentTime - currentTime; //contextのcurrentTimeと開始位置
        isPlayingRef.current = true;

         // 1秒ごとに再生位置を更新
        intervalIdRef.current = window.setInterval(() => {
          updateCurrentTime();
        }, 100); //setIntervalはこのタイマーの識別IDを返却
        console.log("再生を開始しました");
      }
    }
  };

  //一時停止
  const pause = (): void => {
    if (audioContext && sourceNodeRef.current) {
      sourceNodeRef.current.stop(); // 再生を停止
      setCurrentTime(audioContext.currentTime - startTimeRef.current); // 再生位置を保存
      sourceNodeRef.current.disconnect(); // ノードを切断
      sourceNodeRef.current = null;
      isPlayingRef.current = false;
      if (intervalIdRef.current !== null) {
        window.clearInterval(intervalIdRef.current);
        console.log("再生を停止しました");
      }
    }
  };

  const seek = (time: number): void => {
    if (audioContext) {
      pause(); // 現在の再生を停止
      setCurrentTime(time); // 再生位置を更新
      console.log(`再生位置を ${time} 秒に設定しました`);
      if (isPlayingRef.current) {
        play(); // 再生中であれば新しい位置から再開
      }
    }
  };

  const cleanup = (): void => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    console.log("useAudioPlayer: クリーンアップ完了。context",audioContext);
    console.log("useAudioPlayer: クリーンアップ完了。gainnode",gainNode);
    console.log("useAudioPlayer: クリーンアップ完了。sourcenode",sourceNodeRef.current);
  };

  return {
    isPlaying: isPlayingRef.current,
    currentTime,
    duration,
    init,
    play,
    pause,
    seek,
    cleanup
  };
}
