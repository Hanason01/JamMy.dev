import { useState, useRef, useEffect } from "react";

export function useAudioPlayer(audioUrl) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioContextRef = useRef(null);
  const audioElementRef = useRef(null);
  const sourceNodeRef = useRef(null);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
    }

    const audio = audioElementRef.current;

    if (!sourceNodeRef.current) {
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audio);
      sourceNodeRef.current.connect(audioContextRef.current.destination);
    }

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
  }, [audioUrl]);

  const play = () => {
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
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
