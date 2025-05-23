"use client";

import { AudioBuffer, PostSettings, PostProjectFormData, PostProjectRequestData } from "@sharedTypes/types";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, MenuItem, Divider, Alert, CircularProgress } from "@mui/material";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { usePostProjectValidation } from "@validation/usePostProjectValidation";
import { usePostProjectRequest } from "@services/project/usePostProjectRequest";
import { audioEncoder } from "@utils/audioEncoder";

export function PostProjectForm({audioBuffer, settings}: {audioBuffer:AudioBuffer, settings:PostSettings}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string>("");
  const encodedFileRef = useRef<File | null>(null);
  const preVisibility = [
    { label: "公開", value: "is_public" },
    { label: "限定公開", value: "is_private" },
  ];
  const [loading, setLoading] = useState<boolean>(false);

  const { register, handleSubmit, setError, errors } = usePostProjectValidation();

  const { postProject } = usePostProjectRequest();
  const sendDataToAPI = async (
    data: PostProjectFormData,
    audioBuffer: AudioBuffer,
    settings: PostSettings
  ) => {
    setLoading(true);
    setTimeout(async () => {
      try {
        let audioFile = encodedFileRef.current
        if(!encodedFileRef.current){
          audioFile = await audioEncoder(audioBuffer, "FLAC");
          encodedFileRef.current = audioFile;
        }

        if (!audioFile) {
          throw new Error("エンコードされたオーディオファイルがありません");
        }

        const visibilityValue = preVisibility.find((option) => option.label === data.visibility)?.value;

        if (!visibilityValue) {
          console.error("無効な公開範囲が選択されています");
          return;
        }

        const requestData: PostProjectRequestData = {
          "project[title]": data.title,
          "project[description]": data.description,
          "project[visibility]": visibilityValue,
          "project[tempo]": settings.tempo.toString(),
          "project[duration]": settings.duration.toString(),
          "project[audio_file]": audioFile,
        };

        const formData = new FormData();
        Object.entries(requestData).forEach(([key, value]) => {
          formData.append(key, value as string | Blob);
        });

        await postProject(formData);
        window.location.href = "/projects?feedback=project:create:success";
      } catch (error: any) {
        if (error.title) {
          setError("title", { type: "manual", message: error.title });
        } else if (error.description) {
          setError("description", { type: "manual", message: error.description });
        } else {
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
    onSubmit={handleSubmit((data) => sendDataToAPI(data, audioBuffer, settings))}
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
        label="タイトル"
        variant="standard"
        placeholder="25文字以内"
        multiline
          maxRows={5}
        fullWidth
        {...register("title")}
        error={!!errors.title}
        helperText={errors.title?.message}
        />
        <TextField
        label="概要"
        variant="standard"
        multiline
          maxRows={15}
        placeholder="140文字以内"
        fullWidth
        {...register("description")}
        error={!!errors.description}
        helperText={errors.description?.message}
        />
        {/* <TextField
          variant="standard"
          select
          label="カテゴリー"
          fullWidth
          value={category}
          onChange={handleCategoryChange}
          sx={{my:1, width: "40%"}}
          >
          {preCategory.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField> */}
        <TextField
          variant="standard"
          select
          label="公開範囲"
          fullWidth
          defaultValue="公開"
          {...register("visibility")}
          sx={{my:1, width: "40%"}}
          >
          {preVisibility.map((option) => (
            <MenuItem key={option.value} value={option.label}>
            {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      {/* 投稿ボタン*/}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Button
          type="submit"
          variant="primary"
          sx={{ mt: 4}}
          endIcon={loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : <PostAddIcon />}
          disabled={loading}
        >
          投稿する
        </Button>
      </Box>
    </Box>
  );
}