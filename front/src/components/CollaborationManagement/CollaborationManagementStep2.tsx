"use client";

import { AudioBuffer, PostSettings, SetState } from "@sharedTypes/types";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { CollaborationForm } from "@Collaboration/CollaborationForm";
import { AudioPlayer } from "@Project/core_logic/AudioPlayer";
import { useCollaborationManagementContext } from "@context/useCollaborationManagementContext";

export function CollaborationManagementStep2({
  onBack,
  audioBufferForPost,
  setAudioBufferForPost,
} : {
  onBack: (mode: "edit" | "record") => void
  audioBufferForPost?: AudioBuffer;
  setAudioBufferForPost?: SetState<AudioBuffer>;
}){
  // console.log("audioBufferForPostの値（Step1の録音データ）",audioBufferForPost);
  const audioContextRef = useRef<AudioContext | null>(null); //Step2とその子コンポーネント限定
  const [isAudioContextReady, setIsAudioContextReady] = useState<boolean>(false); // 初期化完了フラグ。AudioPlayerの表示の為意図的に再レンダリング行うため


  const {
    postAudioData, setPostAudioData,
    globalAudioContextRef,
    synthesisList, setSynthesisList,
  } = useCollaborationManagementContext();

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
    setAudioBufferForPost?.(null); // 再録時に録音データをリセット
    onBack("record");
  };

  //編集し直すボタンハンドル
  const handleReProcessing = (): void => {
    setAudioBufferForPost?.(null); // 編集時に録音データをリセット
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
      {/* <CollaborationForm audioBuffer={audioBufferForPost} />
      {audioContextRef.current && isAudioContextReady ? (
        <AudioPlayer audioBuffer={audioBufferForPost} audioContext={audioContextRef.current}/>
        ) : (
        <Typography>Loading...</Typography>
      )} */}
       {/* 合成リストの表示 */}
      <Box sx={{ width: "100%", textAlign: "left", mb: 2 }}>
        <Typography variant="h6">合成リストの内容:</Typography>
        {synthesisList.length > 0 ? (
          synthesisList.map((item, index) => (
            <Box key={index} sx={{ mt: 1, p: 1, border: "1px solid gray", borderRadius: "5px" }}>
              <Typography variant="body1">ユーザー: {item.user?.nickname || item.user?.username}</Typography>
              <Typography variant="body2">コメント: {item.comment || "なし"}</Typography>
              <Typography variant="body2">AudioBuffer: {item.audioBuffer ? "存在します" : "ありません"}</Typography>
            </Box>
          ))
        ) : (
          <Typography>合成リストが空です。</Typography>
        )}
      </Box>

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