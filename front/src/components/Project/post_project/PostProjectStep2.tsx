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
  // console.log("audioBufferForPostの値（Step1の録音データ）",audioBufferForPost);
  const audioContextRef = useRef<AudioContext | null>(null); //Step2とその子コンポーネント限定
  const [isAudioContextReady, setIsAudioContextReady] = useState<boolean>(false); // 初期化完了フラグ。AudioPlayerの表示の為意図的に再レンダリング行うため

  //初期化処理（AudioPlayerへ渡す用のaudioContextを作成）
  useEffect(() => {
    // console.log(`[${new Date().toISOString()}] PostProjectStep2がマウントされました`);
    if (audioBufferForPost && !audioContextRef.current){
      audioContextRef.current= new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100
      })
      setIsAudioContextReady(true);
      // console.log("audioContextRef",audioContextRef.current);
    }
    return () => {
      audioContextRef.current = null;
      // console.log(`PostProjectStep2がアンマウントされました[${new Date().toISOString()}]`);
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