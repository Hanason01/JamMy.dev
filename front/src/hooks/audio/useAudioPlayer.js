import { useState, useRef, useEffect } from "react";

export function useAudioPlayer(audioBuffer, audioContext, gainNode) {
  const [isPlaying, setIsPlaying] = useState(false); //再生状態
  const [currentTime, setCurrentTime] = useState(0); //スライダー位置
  const [duration, setDuration] = useState(0); //データの総秒数
  const sourceNodeRef = useRef(null); //WebAudioAPIのcurrentTime
  const startTimeRef = useRef(0); // 再生開始時間を保持
  const intervalIdRef = useRef(null); // setInterval のID（currentTimeを更新する頻度の管理）

  // 各操作に対応してノード初期化を行う関数
  const createSourceNode = () => {
    if (audioContext && audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      //親で作成されたGainNodeへの接続
      source.connect(gainNode);
      //AudioBufferSourceNodeのendイベントハンドラ（初期化）
      source.onended = () => {
        if (isPlaying) {
        setIsPlaying(false);
        setCurrentTime(0);
        clearInterval(intervalIdRef.current);
        }
      };
      return source;
    }
    return null;
  };

  //初期化
  const init = () => {
    // AudioBufferSourceNode の初期化
    if (audioContext && audioBuffer) {
      setDuration(audioBuffer.duration);
      console.log("useAudioPlayerの初期化に成功");
    } else {
      console.error("useAudioPlayerの初期化に失敗");
    }
  };

  //currentTimeの更新
  const updateCurrentTime = () => {
    if (audioContext) {
      const elapsed = audioContext.currentTime - startTimeRef.current;
      setCurrentTime(Math.min(elapsed, duration)); // 再生位置を更新
    }
  };

  //再生
  const play = () => {
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
        setIsPlaying(true);

         // 1秒ごとに再生位置を更新
        intervalIdRef.current = setInterval(() => {
          updateCurrentTime();
        }, 1000); //setIntervalはこのタイマーの識別IDを返却
        console.log("再生を開始しました");
      }
    }
  };

  //一時停止
  const pause = () => {
    if (audioContext && sourceNodeRef.current) {
      sourceNodeRef.current.stop(); // 再生を停止
      setCurrentTime(audioContext.currentTime - startTimeRef.current); // 再生位置を保存
      sourceNodeRef.current.disconnect(); // ノードを切断
      sourceNodeRef.current = null;
      setIsPlaying(false);
      clearInterval(intervalIdRef.current);
      console.log("再生を停止しました");
    }
  };

  const seek = (time) => {
    if (audioContext) {
      pause(); // 現在の再生を停止
      setCurrentTime(time); // 再生位置を更新
      console.log(`再生位置を ${time} 秒に設定しました`);
      if (isPlaying) {
        play(); // 再生中であれば新しい位置から再開
      }
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalIdRef.current);
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
    };
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    init,
    play,
    pause,
    seek,
  };
}
