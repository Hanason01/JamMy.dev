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
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // 再生状態の再レンダリング用
  const [currentTime, setCurrentTime] = useState<number>(0); //スライダー位置
  const [duration, setDuration] = useState<number>(0); //データの総秒数
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null); //WebAudioAPIのcurrentTime
  const startTimeRef = useRef<number>(0); // 再生開始時間を保持
  const pausedAtRef = useRef<number>(0); // 停止時の再生位置
  const intervalIdRef = useRef<number | null>(null); // setInterval のID（currentTimeを更新する頻度の管理）
  const ignoreOnEndedForPauseRef = useRef<boolean>(false);//pause時のonendedの制御


  // console.log("currentTime追跡", currentTime);
  // console.log("isPlaying追跡", isPlaying);
  // console.log("duration追��", duration);
  // console.log("sourceNodeRef.current追跡", sourceNodeRef.current);
  // console.log("startTimeRef.current追跡", startTimeRef.current);
  // console.log("pausedAtRef.current追跡", pausedAtRef.current);
  // console.log("intervalIdRef.current追跡", intervalIdRef.current);

  // 各操作に対応してノード初期化を行う関数
  const createSourceNode = (): AudioBufferSourceNode | null => {
    if (audioContext && audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      //親で作成されたGainNodeへの接続（Step1限定）
      if (gainNode){
        source.connect(gainNode);
        console.log(`[id:${id}] GainNodeに接続しました`);
      } else { //Step2の場合
        source.connect(audioContext.destination);
        console.log(`[id:${id}] AudioContext.destinationに接続しました`);
      }

      //AudioBufferSourceNodeのendイベントハンドラ（初期化）
      source.onended = () => {
        // pause時のstopに対しては無視
        if (ignoreOnEndedForPauseRef.current) {
          ignoreOnEndedForPauseRef.current = false;
          console.log(`[id:${id}] onendedが無視されました（同期処理中）`);
          return;
        }

        console.log(`[id:${id}!]onended が発動しました。isPlaying:`,isPlayingRef.current);
        console.log(`[id:${id}] 再生終了時のsourceNodeRef:`, sourceNodeRef.current);
        console.log(`[id:${id}!]onended が発動しました。ignoreOnEndedForPauseRef:`,ignoreOnEndedForPauseRef.current);
        if (isPlayingRef.current) {
          stopInterval();
          resetCoreLogic();

          // 再生指示フラグのリセット
          if (enablePostAudioPreview && id) {
            setIsPlaybackTriggered(false);
            playbackTriggeredByRef.current = null;
            console.log(`[id:${id}] 自然終了により再生指示フラグをリセットしました`);
          }

          console.log(`[id:${id}!]自然終了によりリセット処理がされました`);
        }
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
      console.log(`[id:${id}!]useAudioPlayerの初期化に成功`);
    } else {
      console.error(`[id:${id}!]useAudioPlayerの初期化に失敗`);
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
      console.log(`[id:${id}!]再生中のAudioBufferSourceNodeを切断しました`);
    }
    resetCoreLogic();
    console.log(`[id:${id}!]再生位置をリセットしました`);
  };

  //reset処理共通化
  const resetCoreLogic = (): void => {
    setCurrentTime(0); //再生位置リセット
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
    console.log(`[id:${id}!]再生直前のisPlayingRef追跡`,isPlayingRef.current);
    console.log(`[id:${id}!]再生直前のisPlaybackTriggered追跡`, isPlaybackTriggered);
    console.log(`[id:${id}!]再生直前のplaybackTriggeredByRef追跡`, playbackTriggeredByRef.current);
    if (audioContext) {
      console.log(`[id:${id}] 再生開始前のsourceNodeRef:`, sourceNodeRef.current);
      console.log(`[id:${id}] AudioContext state:`, audioContext.state);
      console.log(`[id:${id}] 再生開始前のGainNode接続状況:`, gainNode);

      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect(); // 古いノードを切断
        console.log(`[id:${id}] 古いsourceNodeを切断しました`);
      }

      const source = createSourceNode(); // 新しいノードを作成

      if (source) {
        sourceNodeRef.current = source;
        const playbackStart = pausedAtRef.current || currentTime; // 停止位置または現在のスライダー位置

        //再生フラグ
        isPlayingRef.current = true;
        setIsPlaying(true); // 状態を更新して再レンダリング

        startTimeRef.current = audioContext.currentTime - playbackStart;

        source.start(0, playbackStart); // 現在の再生位置から再生（第一引数は再生までの延滞時間）
        console.log(`[id:${id}] 再生を開始しました: playbackStart=${playbackStart}, currentTime=${audioContext.currentTime}`);
        startTimeRef.current = audioContext.currentTime - currentTime; //contextのcurrentTimeと開始位置

         // 1秒ごとに再生位置を更新
        intervalIdRef.current = window.setInterval(() => {
          const elapsed = audioContext.currentTime - startTimeRef.current;
          setCurrentTime(Math.min(elapsed, duration));
          // updateCurrentTime();
        }, 100); //setIntervalはこのタイマーの識別IDを返却
        console.log(`[id:${id}!]再生を開始しました`);
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
      //再生フラグ
      isPlayingRef.current = false;
      setIsPlaying(false); // 状態を更新して再レンダリング
      ignoreOnEndedForPauseRef.current = true; //onended制御用

      pausedAtRef.current = audioContext.currentTime - startTimeRef.current; // 停止時の再生位置を記録
      sourceNodeRef.current.stop(); // 再生を停止
      sourceNodeRef.current.disconnect(); // ノードを切断
      sourceNodeRef.current = null;
      stopInterval();
      console.log(`[id:${id}!]再生を停止しました`);
    }
  };

  const seek = (time: number): void => {
    if (audioContext) {
      if (isPlayingRef.current) {
        pause();
        //同時再生の場合、相手方も停止させる
        if (enablePostAudioPreview && id) {
          setIsPlaybackTriggered(false);
        }
      }
      // 再生位置を更新
      pausedAtRef.current = time;
      setCurrentTime(time);

      // 現在のsourceNodeをクリアして、次回再生時に再生成
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      console.log(`[id:${id}!]再生位置を ${time} 秒に設定しました`);
    }
  };

  //IDの異なるAudioPlayerの再生位置変更を自身の位置に適用する専用関数
  const syncPosition = (time: number): void => {
    if (audioContext) {
      // 再生位置を更新
      pausedAtRef.current = time;
      setCurrentTime(time);
      console.log(`[id:${id}] 再生位置を同期しました: ${time} 秒`);
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
    // 再生指示フラグのリセット
    if (enablePostAudioPreview && id) {
      setIsPlaybackTriggered(false);
      playbackTriggeredByRef.current = null;
      console.log(`[id:${id}] cleanupにより再生指示フラグをリセットしました`);
    }
    console.log(`[id:${id}!]useAudioPlayer: クリーンアップ完了。context`,audioContext);
    console.log(`[id:${id}!]useAudioPlayer: クリーンアップ完了。gainnode`,gainNode);
    console.log(`[id:${id}!]useAudioPlayer: クリーンアップ完了。sourcenode`,sourceNodeRef.current);
  };

  return {
    isPlayingRef: isPlayingRef,
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
