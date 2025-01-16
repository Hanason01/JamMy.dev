"use client";

import { AudioBuffer, PostCollaborationFormData, PostCollaborationRequestData, User, Project } from "@sharedTypes/types";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, MenuItem, Divider, Alert, CircularProgress } from "@mui/material";
import { usePostCollaborationValidation } from "@validation/usePostCollaborationValidation";
import { usePostCollaborationRequest } from "@services/project/collaboration/usePostCollaborationRequest";
import { audioEncoder } from "@utiles/audioEncoder";
import { useProjectContext } from "@context/useProjectContext";

export function CollaborationForm({audioBuffer}: {audioBuffer:AudioBuffer}) {
  const { currentProject, setCurrentProject, currentUser, setCurrentUser } = useProjectContext();
  const router = useRouter();
  const [formError, setFormError] = useState<string>("");
  const encodedFileRef = useRef<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // ローディング状態

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
          console.log("エンコード処理に送るaudioBuffer", audioBuffer);
          audioFile = await audioEncoder(audioBuffer, "FLAC");
          encodedFileRef.current = audioFile;
          console.log("エンコード後のファイル",audioFile);
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
        console.log("リクエスト送信前のformData", formData);

        if (currentProject){
          await postCollaboration(formData, currentProject.id);
          router.push("/projects?refresh=true");
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
        label="応募先ユーザー名"
        variant="standard"
        defaultValue={currentUser?.attributes.nickname || currentUser?.attributes.username || "不明なユーザー"}
        fullWidth
        slotProps={{
          input: {readOnly: true},
        }}
        />
        <TextField
        label="応募先タイトル"
        variant="standard"
        defaultValue={currentProject?.attributes.title || "不明なタイトル"}
        fullWidth
        slotProps={{
          input: {readOnly: true},
        }}
        />
        <TextField
        label="コメント（任意）"
        variant="standard"
        placeholder="投稿者へコメント"
        fullWidth
        {...register("comment")}
        error={!!errors.comment}
        helperText={errors.comment?.message}
        />
        {loading ? (
          <CircularProgress
            size={48}
            sx={{
              color: "primary",
            }}
          />
        ) : (
          <Button type="submit" variant="primary" sx={{mt:4}} >
            投稿する
          </Button>
        )}
      </Box>
    </Box>
  );
}