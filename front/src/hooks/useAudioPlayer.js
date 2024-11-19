import { useState, useEffect, useRef } from "react";

export function useAudioPlayer(audioUrl) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioElementRef = useRef(null);

  useEffect(() => {
    audioElementRef.current = new Audio(audioUrl);
    const audio = audioElementRef.current;

    // メタデータがロードされたら再生時間を設定
    const handleMetadata = () => setDuration(Math.floor(audio.duration));
    audio.addEventListener("loadedmetadata", handleMetadata);

    // 再生中の時間を更新
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    // クリーンアップ
    return () => {
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  const play = () => {
    audioElementRef.current.play();
    setIsPlaying(true);
  };

  const pause = () => {
    audioElementRef.current.pause();
    setIsPlaying(false);
  };

  const seek = (time) => {
    audioElementRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    seek,
  };
}
