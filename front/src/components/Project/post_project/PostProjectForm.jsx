"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, MenuItem, Divider, Alert } from "@mui/material";
import { usePostProjectValidation } from "../../../hooks/validation/usePostProjectValidation";
import { usePostProjectRequest } from "../../../hooks/services/project/usePostProjectRequest";
import { audioEncoder } from "../../../utiles/audioEncoder";

export function PostProjectForm({audioBuffer, settings}) {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const encodedFileRef = useRef(null);
  // const [category, setCategory] = useState("音楽"); //カテゴリー
  // const [visibility, setVisibility] = useState("公開"); //公開範囲
  // const preCategory = ["音楽","その他"]
  // const preVisibility = ["公開","限定公開"]

  const { register, handleSubmit, setError, errors } = usePostProjectValidation();

  const { postProject } = usePostProjectRequest();
  const sendDataToAPI = async (data, audioBuffer, settings) => {
    try {
      let audioFile = encodedFileRef.current
      //エンコード処理
      if(!encodedFileRef.current){
        audioFile = await audioEncoder(audioBuffer, "FLAC");
        encodedFileRef.current = audioFile;
        console.log("エンコード後のファイル",audioFile);
      }
      // フォームデータの結合
      console.log("フォームに入れるsettings情報",settings);
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("tempo", settings.tempo);
      formData.append("duration", settings.duration);
      formData.append("audio", audioFile);
      console.log("リクエスト送信前のformData", formData);

      await postProject(formData);
      router.push(redirectTo || "/projects");
    } catch (error) {
      if (error.title) {
        setError("title", { type: "manual", message: error.title });
      } else if (error.description) {
        setError("description", { type: "manual", message: error.description });
      } else {
        // 他の特定フィールドでのエラーがない場合、フォーム全体に対するエラーメッセージを設定
        setFormError(error.general);
      }
    }
  };

  // const handleCategoryChange = (event) => setCategory(event.target.value);
  // const handleVisibilityChange = (event) => setVisibility(event.target.value);

  return (
    <Box
    component= "form"
    onSubmit={handleSubmit(sendDataToAPI)}
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
        {/* <TextField
          variant="standard"
          select
          label="公開範囲"
          fullWidth
          value={visibility}
          onChange={handleVisibilityChange}
          sx={{my:1, width: "40%"}}
          >
          {preVisibility.map((visibility) => (
            <MenuItem key={visibility} value={visibility}>
              {visibility}
            </MenuItem>
          ))}
        </TextField> */}
        {/* <Box display="flex"> */}
          {/* <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt:2}}>
            下書き保存
          </Button> */}
        <Button type="submit" variant="primary" >
          投稿する
        </Button>
        {/* </Box> */}

      </Box>
    </Box>
  );
}