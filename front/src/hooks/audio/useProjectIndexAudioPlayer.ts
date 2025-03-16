import { useState, useEffect, useRef } from "react";

export function useProjectIndexAudioPlayer(audioElement: HTMLAudioElement | null) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const isPlayingRef = useRef<boolean>(false);

  //isPlayingRefとisPlayingの同期（イベントリスナーによるStateの固定化(クロージャー)を避けるため、isPlayingRefを使用）
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  },[isPlaying]);

  useEffect(() => {
    if (!audioElement) return;

    // メタデータがロードされたら再生時間を設定
    const handleMetadata = () => setDuration(Math.floor(audioElement.duration));
    audioElement.addEventListener("loadedmetadata", handleMetadata);

    // 再生中の時間を更新
    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);
    audioElement.addEventListener("timeupdate", handleTimeUpdate);

    // 再生終了時の処理
    const handleEnded = () => {
      setCurrentTime(0); // スライダーをリセット
      setIsPlaying(false); // 再生状態をリセット
    };
    audioElement.addEventListener("ended", handleEnded);

    // クリーンアップ
    return () => {
      audioElement.removeEventListener("loadedmetadata", handleMetadata);
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []); //選択されたaudioDataが変わる度に再初期化

  const play = ():void=> {
    setIsPlaying(true);
    audioElement?.play();
  };

  const pause = ():void => {
    setIsPlaying(false);
    audioElement?.pause();
  };

  const seek = (time: number):void => {
    if (audioElement) {
      audioElement.currentTime = time;
      setCurrentTime(time);
    }
  };

  return {
    isPlaying,
    isPlayingRef,
    currentTime,
    duration,
    play,
    pause,
    seek,
  };
}
