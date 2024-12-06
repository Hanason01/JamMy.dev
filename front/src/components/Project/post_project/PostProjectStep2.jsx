"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { PostProjectForm } from "./PostProjectForm";
import { AudioPlayer } from "../core_logic/AudioPlayer";

export function PostProjectStep2({onBack, audioBufferForPost,  settingsForPostRef, activeStep}){
  console.log("audioBufferForPostの値（Step1の録音データ）",audioBufferForPost);
  const audioContextRef = useRef(null); //Step2とその子コンポーネント限定
  const [isAudioContextReady, setIsAudioContextReady] = useState(false); // 初期化完了フラグ。AudioPlayerの表示の為意図的に再レンダリング行うため

  //初期化処理（AudioPlayerへ渡す用のaudioContextを作成）
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] PostProjectStep2がマウントされました`);
    if (audioBufferForPost && !audioContextRef.current){
      audioContextRef.current= new (window.AudioContext || window.webkitAudioContext)()
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
      <PostProjectForm audioBuffer={audioBufferForPost} settings={settingsForPostRef} />
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