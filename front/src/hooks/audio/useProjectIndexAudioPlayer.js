import { useState, useEffect, useRef } from "react";

export function useProjectIndexAudioPlayer(audioData) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioElementRef = useRef(null);

  useEffect(() => {
    // Blob を作成して URL を生成
    const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Audio オブジェクトを初期化
    audioElementRef.current = new Audio(audioUrl);
    const audio = audioElementRef.current;

    // メタデータがロードされたら再生時間を設定
    const handleMetadata = () => setDuration(Math.floor(audio.duration));
    audio.addEventListener("loadedmetadata", handleMetadata);

    // 再生中の時間を更新
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    // 再生終了時の処理
    const handleEnded = () => {
      setCurrentTime(0); // スライダーをリセット
      setIsPlaying(false); // 再生状態をリセット
    };
    audio.addEventListener("ended", handleEnded);

    // クリーンアップ
    return () => {
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
       // オブジェクトURLを解放
      URL.revokeObjectURL(audioUrl);
    };
  }, [audioData]); //選択されたaudioDataが変わる度に再初期化

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
