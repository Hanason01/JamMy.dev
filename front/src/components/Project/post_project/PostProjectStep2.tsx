"use client";

import { AudioBuffer, PostSettings, SetState } from "@sharedTypes/types";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import BackspaceIcon from '@mui/icons-material/Backspace';
import HeadsetIcon from '@mui/icons-material/Headset';
import { PostProjectForm } from "@components/Project/post_project/PostProjectForm";
import { AudioPlayer } from "@Project/core_logic/AudioPlayer";

export function PostProjectStep2({
  onBack,
  audioBufferForPost,
  setAudioBufferForPost,
  settingsForPost,
} : {
  onBack: (mode: "edit" | "record") => void
  audioBufferForPost: AudioBuffer;
  setAudioBufferForPost: SetState<AudioBuffer>;
  settingsForPost: PostSettings;
}){
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isAudioContextReady, setIsAudioContextReady] = useState<boolean>(false);

  //初期化
  useEffect(() => {
    if (audioBufferForPost && !audioContextRef.current){
      audioContextRef.current= new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100
      })
      setIsAudioContextReady(true);
    }

    return () => {
      audioContextRef.current?.close().then(() => {
        audioContextRef.current = null;
      });
    };
  }, []);


  //録音し直すボタンハンドル
  const handleReRecording = (): void => {
    setAudioBufferForPost(null);
    onBack("record");
  };


  //編集し直すボタンハンドル
  const handleReProcessing = (): void => {
    setAudioBufferForPost(null);
    onBack("edit");
  };


  return(
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      maxWidth: "600px",
      p:2,
      gap:3
    }}>
      <PostProjectForm audioBuffer={audioBufferForPost} settings={settingsForPost} />
        {/* 音声プレビュー部分 */}
        <Box sx={{ width: "100%", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <HeadsetIcon sx={{ fontSize: 28, color: "primary.main", mr: 1 }} />
            <Typography variant="h6">
              音声プレビュー
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            録音・編集した音声の確認ができます
          </Typography>
        </Box>
      {audioContextRef.current && isAudioContextReady ? (
        <AudioPlayer audioBuffer={audioBufferForPost} audioContext={audioContextRef.current} />
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
        <Button onClick={handleReProcessing} variant="primary" startIcon={<ArrowBackIosIcon />}>
          編集し直す
        </Button>
        <Button onClick={handleReRecording} variant="primary" startIcon={<BackspaceIcon />}>
          録音し直す
        </Button>
      </Box>
    </Box>
  );
};