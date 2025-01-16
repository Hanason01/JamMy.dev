"use client";

import { AudioBuffer, PostCollaborationFormData, CollaborationManagementRequestData, User, Project } from "@sharedTypes/types";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {Typography, Box, TextField, Button, MenuItem, Divider, Alert, CircularProgress } from "@mui/material";
import { AudioPlayer } from "@Project/core_logic/AudioPlayer";
import { useCompleteCollaborationManagementRequest } from "@services/project/collaboration_management/useCompleteCollaborationManagementRequest";
import { audioEncoder } from "@utiles/audioEncoder";
import { useProjectContext } from "@context/useProjectContext";
import { useCollaborationManagementContext } from "@context/useCollaborationManagementContext";
import { Mode } from "@mui/icons-material";

export function CollaborationManagementStep3({onBack}:{onBack: () => void;}) {
  //Context関係
  const {
    currentProject, setCurrentProject,
    currentUser, setCurrentUser,
  } = useProjectContext();

  const {
    globalAudioContextRef,
    mergedAudioBuffer, setMergedAudioBuffer
  } = useCollaborationManagementContext();

  //状態変数
  const router = useRouter();
  const [formError, setFormError] = useState<string>("");
  const encodedFileRef = useRef<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // ローディング状態



  //初期化
  useEffect(() => {
    // contextがなければセッションストレージから復元
    if (!currentProject && !currentUser) {
      setCurrentProject(JSON.parse(sessionStorage.getItem("currentProject") || "null"));
      setCurrentUser(JSON.parse(sessionStorage.getItem("currentUser") || "null"));
    }
  }, []);

  //応募リクエスト処理
  const { completeCollaborationManagement } = useCompleteCollaborationManagementRequest();
  const sendDataToAPI = async (mode: string,) => {
    setLoading(true);
    setTimeout(async () => {
      try {
        let audioFile = encodedFileRef.current
        //エンコード処理
        if(!encodedFileRef.current){
          console.log("エンコード処理に送るaudioBuffer", mergedAudioBuffer);
          if(mode === "save"){
            audioFile = await audioEncoder(mergedAudioBuffer, "FLAC");
          } else if(mode === "terminate"){
            audioFile = await audioEncoder(mergedAudioBuffer, "MP3");
          }
          encodedFileRef.current = audioFile;
          console.log("エンコード後のファイル",audioFile);
        }

        //audioFileチェック
        if (!audioFile) {
          throw new Error("エンコードされたオーディオファイルがありません");
        }

        // リクエストデータ作成
        const requestData: CollaborationManagementRequestData = {
          //commentが未定義もしくはundefined（未入力）の場合は空文字を代入
          "project[mode]": mode,
          "project[audio_file]": audioFile,
        };

        // FormData の生成
        const formData = new FormData();
        Object.entries(requestData).forEach(([key, value]) => {
          formData.append(key, value as string | Blob); // 型をキャストして挿入
        });
        console.log("リクエスト送信前のformData", formData);

        if (currentProject){
          await completeCollaborationManagement(currentProject.id, formData);
          router.push("/projects?refresh=true");
        }
      } catch (error: any) {
        if (error.general) {
          setFormError(error.general);
        }
      } finally {
        setLoading(false);
      }
    }, 100);
  };


  //合成リストへ戻る
  const handleBackToStep2 = () =>{
    setMergedAudioBuffer(null);
    onBack();
  }

  return (
    <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "80%",
      gap: 3,
      my: 3,
    }}>
      {formError && <Alert severity="error">{formError}</Alert>}
      <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        width: "100%"
      }}>
        <TextField
        label="ユーザー名"
        variant="standard"
        defaultValue={currentUser?.attributes.nickname || currentUser?.attributes.username || "不明なユーザー"}
        fullWidth
        slotProps={{
          input: {readOnly: true},
        }}
        />
        <TextField
        label="タイトル"
        variant="standard"
        defaultValue={currentProject?.attributes.title || "不明なタイトル"}
        fullWidth
        slotProps={{
          input: {readOnly: true},
        }}
        />
        <TextField
        label="概要"
        variant="standard"
        defaultValue={currentProject?.attributes.description || "不明な概要"}
        fullWidth
        slotProps={{
          input: {readOnly: true},
        }}
        />

        {globalAudioContextRef.current && mergedAudioBuffer ? (
        <Box>
          <Typography>合成後の音声</Typography>
          <AudioPlayer
          audioBuffer={mergedAudioBuffer}
          audioContext={globalAudioContextRef.current}/>
        </Box>
        ) : (
        <Typography>Loading...</Typography>
      )}
        {loading ? (
          <CircularProgress
            size={48}
            sx={{
              color: "primary",
            }}
          />
        ) : (
          <Box>
            <Button onClick={()=>sendDataToAPI("save")} variant="primary" sx={{mt:4}} >
              保存する
            </Button>
            <Button onClick={handleBackToStep2} variant="primary" sx={{mt:4}} >
              合成リストへ戻る
            </Button>
            <Button onClick={()=>sendDataToAPI("terminate")} variant="primary" sx={{mt:4}} >
              このプロジェクトを終了にする
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}