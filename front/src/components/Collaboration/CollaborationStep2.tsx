"use client";

import { AudioBuffer, PostSettings, SetState } from "@sharedTypes/types";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { CollaborationForm } from "@Collaboration/CollaborationForm";
import { AudioPlayer } from "@Project/core_logic/AudioPlayer";

export function CollaborationStep2({
  onBack,
  audioBufferForPost,
  setAudioBufferForPost,
} : {
  onBack: (mode: "edit" | "record") => void
  audioBufferForPost: AudioBuffer;
  setAudioBufferForPost: SetState<AudioBuffer>;
}){
  // console.log("audioBufferForPostの値（Step1の録音データ）",audioBufferForPost);
  const audioContextRef = useRef<AudioContext | null>(null); //Step2とその子コンポーネント限定
  const [isAudioContextReady, setIsAudioContextReady] = useState<boolean>(false); // 初期化完了フラグ。AudioPlayerの表示の為意図的に再レンダリング行うため

  //初期化処理（AudioPlayerへ渡す用のaudioContextを作成）
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] CollaborationStep2がマウントされました`);
    if (audioBufferForPost && !audioContextRef.current){
      audioContextRef.current= new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100
      })
      setIsAudioContextReady(true);
      console.log("audioContextRef",audioContextRef.current);
    }
    return () => {
      audioContextRef.current = null;
      console.log(`CollaborationStep2がアンマウントされました[${new Date().toISOString()}]`);
    };
  }, []);

  //録音し直すボタンハンドル
  const handleReRecording = (): void => {
    setAudioBufferForPost(null); // 再録時に録音データをリセット
    onBack("record");
  };

  //編集し直すボタンハンドル
  const handleReProcessing = (): void => {
    setAudioBufferForPost(null); // 編集時に録音データをリセット
    onBack("edit");
  };

  return(
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap:3
    }}>
      <CollaborationForm audioBuffer={audioBufferForPost} />
      {audioContextRef.current && isAudioContextReady ? (
        <AudioPlayer audioBuffer={audioBufferForPost} audioContext={audioContextRef.current}/>
        ) : (
        <Typography>Loading...</Typography>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Button onClick={handleReProcessing} variant="primary">
          編集し直す
        </Button>
        <Button onClick={handleReRecording} variant="primary">
          録音し直す
        </Button>
      </Box>
    </Box>

  );
};