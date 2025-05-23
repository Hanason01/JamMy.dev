"use client";

import { AudioBuffer, PostCollaborationFormData, PostCollaborationRequestData, User, Project } from "@sharedTypes/types";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, MenuItem, Divider, Alert, CircularProgress } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { usePostCollaborationValidation } from "@validation/usePostCollaborationValidation";
import { usePostCollaborationRequest } from "@services/project/collaboration/usePostCollaborationRequest";
import { audioEncoder } from "@utils/audioEncoder";
import { useProjectContext } from "@context/useProjectContext";
import { useFeedbackContext } from "@context/useFeedbackContext";

export function CollaborationForm({audioBuffer}: {audioBuffer:AudioBuffer}) {
  const { currentProject, setCurrentProject, currentUser, setCurrentUser } = useProjectContext();
  const { setFeedbackByKey } = useFeedbackContext();
  const router = useRouter();
  const [formError, setFormError] = useState<string>("");
  const encodedFileRef = useRef<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { register, handleSubmit, setError, errors } = usePostCollaborationValidation();


  //初期化
  useEffect(() => {
    // contextがなければセッションストレージから復元
    if (!currentProject && !currentUser) {
      setCurrentProject(JSON.parse(sessionStorage.getItem("currentProject") || "null"));
      setCurrentUser(JSON.parse(sessionStorage.getItem("currentUser") || "null"));
    }
  }, []);

  //応募リクエスト処理
  const { postCollaboration } = usePostCollaborationRequest();
  const sendDataToAPI = async (
    data: PostCollaborationFormData,
    audioBuffer: AudioBuffer,
  ) => {
    setLoading(true);
    setTimeout(async () => {
      try {
        let audioFile = encodedFileRef.current
        //エンコード処理
        if(!encodedFileRef.current){
          audioFile = await audioEncoder(audioBuffer, "FLAC");
          encodedFileRef.current = audioFile;
        }

        //audioFileチェック
        if (!audioFile) {
          throw new Error("エンコードされたオーディオファイルがありません");
        }

        // リクエストデータ作成
        const requestData: PostCollaborationRequestData = {
          //commentが未定義もしくはundefined（未入力）の場合は空文字を代入
          "collaboration[comment]": data.comment?.trim() || "",
          "collaboration[audio_file]": audioFile,
        };

        // FormData の生成
        const formData = new FormData();
        Object.entries(requestData).forEach(([key, value]) => {
          formData.append(key, value as string | Blob); // 型をキャストして挿入
        });

        if (currentProject){
          await postCollaboration(formData, currentProject.id);
          window.location.href = "/projects?feedback=collaboration:create:success";
        }
      } catch (error: any) {
        if (error.comment) {
          setError("comment", { type: "manual", message: error.comment });
        } else {
          // 他の特定フィールドでのエラーがない場合、フォーム全体に対するエラーメッセージを設定
          setFormError(error.general);
        }
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  return (
    <Box
    component= "form"
    onSubmit={handleSubmit((data: PostCollaborationFormData) => sendDataToAPI(data, audioBuffer))}
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      maxWidth: "600px",
      gap: 3,
      my: 3,
    }}>
      {formError && <Alert severity="error">{formError}</Alert>}
      <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 3,
        width: "100%"
      }}>
        <TextField
        label="応募先ユーザー名"
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
        label="応募先タイトル"
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
        label="コメント（任意）"
        variant="standard"
        placeholder="投稿者へコメント"
        fullWidth
        multiline
          maxRows={5}
        {...register("comment")}
        error={!!errors.comment}
        helperText={errors.comment?.message}
        />
        {/* 投稿ボタン*/}
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Button
            type="submit"
            variant="primary"
            sx={{ mt: 4}}
            endIcon={loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : <UploadFileIcon />}
            disabled={loading}
          >
            応募する
          </Button>
        </Box>
      </Box>
    </Box>
  );
}