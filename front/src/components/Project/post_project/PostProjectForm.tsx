"use client";

import { AudioBuffer, PostSettings, PostProjectFormData, PostProjectRequestData } from "@sharedTypes/types";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, MenuItem, Divider, Alert, CircularProgress } from "@mui/material";
import { usePostProjectValidation } from "@validation/usePostProjectValidation";
import { usePostProjectRequest } from "@services/project/usePostProjectRequest";
import { audioEncoder } from "@utiles/audioEncoder";

export function PostProjectForm({audioBuffer, settings}: {audioBuffer:AudioBuffer, settings:PostSettings}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string>("");
  const encodedFileRef = useRef<File | null>(null);
  const preVisibility = [
    { label: "公開", value: "is_public" },
    { label: "限定公開", value: "is_private" },
  ];
  const [loading, setLoading] = useState<boolean>(false); // ローディング状態

  const { register, handleSubmit, setError, errors } = usePostProjectValidation();

  const { postProject } = usePostProjectRequest();
  const sendDataToAPI = async (
    data: PostProjectFormData,
    audioBuffer: AudioBuffer,
    settings: PostSettings
  ) => {
    // console.log("sendDataToAPI発動、3つの引数", data, audioBuffer,settings);
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
        // フォームデータの結合
        // console.log("フォームに入れるsettings情報",settings);
        // console.log("フォームに入れるdata情報",data);
        // console.log("フォームに入れるaudioFile",audioFile);

        //audioFileチェック
        if (!audioFile) {
          throw new Error("エンコードされたオーディオファイルがありません");
        }

        // リクエストデータ作成
        const requestData: PostProjectRequestData = {
          "project[title]": data.title,
          "project[description]": data.description,
          "project[visibility]": preVisibility.find((option) => option.label === data.visibility)?.value || "is_public",
          "project[tempo]": settings.tempo.toString(),
          "project[duration]": settings.duration.toString(),
          "project[audio_file]": audioFile,
        };

        // FormData の生成
        const formData = new FormData();
        Object.entries(requestData).forEach(([key, value]) => {
          formData.append(key, value as string | Blob); // 型をキャストして挿入
        });
        console.log("リクエスト送信前のformData", formData);

        await postProject(formData);
        router.push("/projects?refresh=true");
      } catch (error: any) {
        if (error.title) {
          setError("title", { type: "manual", message: error.title });
        } else if (error.description) {
          setError("description", { type: "manual", message: error.description });
        } else {
          // 他の特定フィールドでのエラーがない場合、フォーム全体に対するエラーメッセージを設定
          setFormError(error.general);
        }
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  // const handleCategoryChange = (event) => setCategory(event.target.value);

  return (
    <Box
    component= "form"
    onSubmit={handleSubmit((data) => sendDataToAPI(data, audioBuffer, settings))}
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
        label="タイトル"
        variant="standard"
        placeholder="50文字以内"
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
        label="ハッシュタグ"
        variant="standard"
        placeholder="#ハッシュタグA、ハッシュタグB"
        fullWidth
        {...register("hashtag")}
        error={!!errors.hashtag}
        helperText={errors.hashtag?.message}
        /> */}
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