"use client";

import { AudioBuffer, PostCollaborationFormData, CollaborationManagementRequestData, User, Project } from "@sharedTypes/types";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {Typography, Box, TextField, Button,Avatar, MenuItem, Divider, Alert, CircularProgress,Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,  } from "@mui/material";
import { AudioPlayer } from "@Project/core_logic/AudioPlayer";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useCompleteCollaborationManagementRequest } from "@services/project/collaboration_management/useCompleteCollaborationManagementRequest";
import { audioEncoder } from "@utils/audioEncoder";
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
    mergedAudioBuffer, setMergedAudioBuffer,
    synthesisList
  } = useCollaborationManagementContext();

  //状態変数
  const router = useRouter();
  const [formError, setFormError] = useState<string>("");
  const encodedFileRef = useRef<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // ローディング状態
  const [openTerminateDialog, setOpenTerminateDialog] = useState<boolean>(false); //終了確認ダイアログ



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
        let audioFile = encodedFileRef.current;
        let urlParams = "";
        //エンコード処理
        if(!encodedFileRef.current){
          console.log("エンコード処理に送るaudioBuffer", mergedAudioBuffer);
          if(mode === "save"){
            urlParams = "collaboration_management:update:success";
            audioFile = await audioEncoder(mergedAudioBuffer, "FLAC");
          } else if(mode === "terminate"){
            urlParams = "collaboration_management:terminate:success";
            audioFile = await audioEncoder(mergedAudioBuffer, "MP3");
          }
          encodedFileRef.current = audioFile;
          console.log("エンコード後のファイル",audioFile);
        }

        //audioFileチェック
        if (!audioFile) {
          throw new Error("エンコードされたオーディオファイルがありません");
        }

        // currentProject の存在確認
        if (!currentProject || !currentProject.id) {
          console.error("currentProject が null または ID が存在しません");
          return;
        }

        // collaborationIds を synthesisList から抽出
        const collaborationIds = synthesisList.map((item) => item.id);

        // リクエストデータ作成
        const requestData: CollaborationManagementRequestData = {
          //commentが未定義もしくはundefined（未入力）の場合は空文字を代入
          "project[mode]": mode,
          "project[audio_file]": audioFile,
          "project[project_id]":currentProject.id,
          "project[collaboration_ids][]":collaborationIds,
        };

        // FormData の生成
        const formData = new FormData();
        Object.entries(requestData).forEach(([key, value]) => {
          if (key === "project[collaboration_ids][]") {
            // 配列の場合、各要素を個別に追加
            (value as number[]).forEach((id) => {
              formData.append("project[collaboration_ids][]", id.toString());
            });
          } else {
            formData.append(key, value as string | Blob); // その他の項目を追加
          }
        });
        console.log("リクエスト送信前のformData", formData);

        if (currentProject){
          await completeCollaborationManagement(currentProject.id, formData);
          window.location.href = `/projects/${currentProject.id}/project_show?feedback=${urlParams}`;
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

  // 終了処理の中間関数
  const handleTerminateProxy = () => {
    setOpenTerminateDialog(true);
  };

  // ダイアログの確認後の処理
  const handleDialogConfirmTerminate = () => {
    setLoading(true);
    sendDataToAPI("terminate");
    setOpenTerminateDialog(false);
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
      width: "100%",
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
        width: "90%"
      }}>
        <TextField
        label="ユーザー名"
        variant="standard"
        defaultValue={currentUser?.attributes.nickname || currentUser?.attributes.username || "不明なユーザー"}
        fullWidth
        multiline
          maxRows={2}
        slotProps={{
          input: {readOnly: true},
        }}
        />
        <TextField
        label="タイトル"
        variant="standard"
        defaultValue={currentProject?.attributes.title || "不明なタイトル"}
        fullWidth
        multiline
          maxRows={2}
        slotProps={{
          input: {readOnly: true},
        }}
        />
        <TextField
        label="概要"
        variant="standard"
        defaultValue={currentProject?.attributes.description || "不明な概要"}
        fullWidth
        multiline
          maxRows={5}
        slotProps={{
          input: {readOnly: true},
        }}
        />
      </Box>
      <Box sx={{
          maxWidth: "500px",
          width: "100%",
          mx: "auto",
        }}>
      {globalAudioContextRef.current && mergedAudioBuffer ? (
        <>
        <Box sx={{ display: "flex", alignItems: "center", width: "100%", position: "relative", my:2}}>
          <Avatar src={
                    currentUser?.attributes.avatar_url
                      ? `/api/proxy-image?key=${encodeURIComponent(currentUser.attributes.avatar_url)}`
                      : "/default-icon.png"
                  }
                  alt={currentUser?.attributes.nickname || currentUser?.attributes.username || undefined }
                  sx={{ width: 35, height: 35 }} />
          <Typography
          variant="body2"
          component="span"
          color="textSecondary"
          sx={{
            maxWidth: "60%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            ml: 1,
          }}>
            { currentUser?.attributes.nickname || currentUser?.attributes.username }
          </Typography>
        </Box>
        <Box sx={{ mb:1}}>
          <Typography
          variant="body1"
          color="textPrimary"
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "center",
            }} >
          { currentProject?.attributes.title }
          </Typography>
        </Box>
        <AudioPlayer
          audioBuffer={mergedAudioBuffer}
          audioContext={globalAudioContextRef.current}/>
        </>
        ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100px",
          }}
        >
          <CircularProgress
            size={64}
            sx={{
              color: "primary.main",
            }}
          />
        </Box>
        )}
      </Box>
      <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        width: "100%"
      }}>
        <Box sx={{
          width:"100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          }}>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap:2,
            mt: 2,
            }}>
            <Button onClick={()=>sendDataToAPI("save")} variant="primary" disabled={loading}
            endIcon={loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : <SaveOutlinedIcon />}
            >保存する</Button>
            <Button onClick={handleBackToStep2} variant="primary" startIcon={<ArrowBackIosIcon />} >
              合成リストへ戻る
            </Button>
          </Box>

          <Box sx={{my:3, width:"90%"}}>
            <Divider/>
          </Box>


          <Box>
            <Button onClick={handleTerminateProxy} variant="secondary" endIcon={<ReportProblemIcon sx={{color: "#e53935" }} />} >
              このプロジェクトを終了にする
            </Button>
          </Box>

          {/* 終了用ダイアログ */}
        <Dialog open={openTerminateDialog} onClose={() => setOpenTerminateDialog(false)}>
          <DialogTitle>プロジェクトを終了しますか？</DialogTitle>
          <Divider />
          <DialogContent>
            <DialogContentText>
            プロジェクトを終了すると、以降の応募は受けられず、編集する事も再開する事もできません。まだ合成されていない応募中の音声は削除されます。
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{mb:1}} >
            <Button onClick={() => setOpenTerminateDialog(false)} variant="outlined">
              キャンセル
            </Button>
            <Button onClick={handleDialogConfirmTerminate} variant="contained" color="primary">
              確認
            </Button>
          </DialogActions>
        </Dialog>

        </Box>
      </Box>
    </Box>
  );
}