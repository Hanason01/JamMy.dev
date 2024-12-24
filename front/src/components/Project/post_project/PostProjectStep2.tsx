"use client";

import { AudioBuffer, PostSettings } from "@sharedTypes/types";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { PostProjectForm } from "@components/Project/post_project/PostProjectForm";
import { AudioPlayer } from "@Project/core_logic/AudioPlayer";

export function PostProjectStep2({
  onBack,
  audioBufferForPost,
  settingsForPost,
  activeStep
} : {
  onBack: () => void;
  audioBufferForPost: AudioBuffer;
  settingsForPost: PostSettings;
  activeStep: number;
}){
  // console.log("audioBufferForPostの値（Step1の録音データ）",audioBufferForPost);
  const audioContextRef = useRef<AudioContext | null>(null); //Step2とその子コンポーネント限定
  const [isAudioContextReady, setIsAudioContextReady] = useState<boolean>(false); // 初期化完了フラグ。AudioPlayerの表示の為意図的に再レンダリング行うため

  //初期化処理（AudioPlayerへ渡す用のaudioContextを作成）
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] PostProjectStep2がマウントされました`);
    if (audioBufferForPost && !audioContextRef.current){
      audioContextRef.current= new (window.AudioContext || (window as any).webkitAudioContext)()
      setIsAudioContextReady(true);
      console.log("audioContextRef",audioContextRef.current);
    }
    return () => {
      audioContextRef.current = null;
      console.log(`PostProjectStep2がアンマウントされました[${new Date().toISOString()}]`);
    };
  }, []);


  return(
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap:3
    }}>
      <PostProjectForm audioBuffer={audioBufferForPost} settings={settingsForPost} />
      {audioContextRef.current && isAudioContextReady ? (
        <AudioPlayer audioBuffer={audioBufferForPost} audioContext={audioContextRef.current} activeStep={activeStep}/>
        ) : (
        <Typography>Loading...</Typography>
      )}

      <Button onClick={onBack} variant="primary">録音し直す</Button>
    </Box>

  );
};

//録音し直すが押された時にsetAudioBufferForPost(false)しないといけない。