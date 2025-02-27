"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { UserAttributes, EditUserFormData } from "@sharedTypes/types";
import {Box, Avatar, IconButton, Button, Typography, TextField, CircularProgress, Tooltip,} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { useEditUserValidation } from "@validation/useEditUserValidation";
import { useAuthContext } from "@context/useAuthContext";

export function MyProfile() {
  const [user, setUser] = useState<UserAttributes | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); //プレビュー用

  //編集関係
  const [formError, setFormError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  // const [tempData, setTempData] = useState<EditUserFormData | null>(null);

  //バリデーション
  const { register, handleSubmit, setValue, watch, setError, reset, errors } = useEditUserValidation();

  //context
  const { applyProfileUpdate } = useAuthContext();

  // プロフィール初期化
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/profile`,
          { withCredentials: true }
        );
        const data = res.data.data.attributes;
        // console.log("res.data", res.data);
        setUser(data)
        setAvatarPreview(res.data?.avatar_url);
        reset({ nickname: data.nickname, bio: data.bio ?? "" });
      } catch (error) {
        console.error("プロフィール取得に失敗しました", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // アバターの変更処理
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setValue("avatar", file);
    }
  };

  // 編集モードの切り替え
  const toggleEditMode = () => setIsEditing(true);
  const handleCancelEdit = () => {
    reset({ nickname: user?.nickname || "", bio: user?.bio || "" });
    setAvatar(null);
    setAvatarPreview(user?.avatar_url || null);
    setIsEditing(false);
  };


  // 保存処理
  const onSubmit = async (data: EditUserFormData) => {
    try {
      const formData = new FormData();
      formData.append("user[nickname]", data.nickname);
      if (data.bio !== undefined) {
        formData.append("user[bio]", data.bio ?? "");
      }
      if (avatar) {
        formData.append("user[avatar]", avatar);
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/profile`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const resData = res.data.data.attributes;
      setUser(resData)
      applyProfileUpdate(resData);
      setAvatarPreview(res.data?.avatar_url);
      reset({ nickname: resData.nickname, bio: resData.bio ?? "" });
      setIsEditing(false);
    } catch (error) {
      console.error("プロフィールの更新に失敗しました", error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto", position: "relative" }}>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* アバター + 名前 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box sx={{ position: "relative", width: 80, height: 80 }}>
              <Avatar
                src={avatar
                  ? URL.createObjectURL(avatar)
                  : avatarPreview
                    ? `/api/proxy-image?key=${encodeURIComponent(avatarPreview)}`
                    : "/default-avatar.png"}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "grey.300",
                }}
              />
              <input
                type="file"
                accept="image/*"
                id="avatar-upload"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    bgcolor: "white",
                    boxShadow: 2,
                    "&:hover": { bgcolor: "grey.200" },
                  }}
                >
                  <AddAPhotoIcon />
                </IconButton>
              </label>
            </Box>

            {/* 名前 */}
            <Box sx={{ flex: 1 }}>
              <TextField
                {...register("nickname")}
                label="ニックネーム"
                variant="outlined"
                fullWidth
                size="small"
                value={watch("nickname")}
                error={!!errors.nickname}
                helperText={errors.nickname?.message}
              />
            </Box>
          </Box>

          {/* 自己紹介 */}
          <Box>
            <TextField
              {...register("bio")}
              label="自己紹介"
              variant="outlined"
              fullWidth
              multiline
              value={watch("bio")}
              rows={3}
              placeholder="自己紹介を入力してください"
              error={!!errors.bio}
              helperText={errors.bio?.message}
            />
          </Box>

           {/* キャンセル・保存ボタン */}
          {/* キャンセル・保存ボタン */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt:3 }}>
              <Button variant="outlined" onClick={handleCancelEdit}>
                キャンセル
              </Button>
              {loading ? (
                <CircularProgress
                  size={48}
                  sx={{
                    color: "primary",
                  }}
                />
              ) : (
                <Button type="submit" variant="contained" color="primary">
                  保存
                </Button>
              )}
            </Box>
        </form>
      ) : (
        <>
          {/* アバター + 名前 */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={avatarPreview ? `/api/proxy-image?key=${encodeURIComponent(avatarPreview)}` : "/default-avatar.png"}
                sx={{
                  width: 80,
                  height: 80,
                }}
              />
              {/* 名前 */}
              <Box>
                <Typography variant="h5" sx={{maxWidth: 230}}>
                  {user?.nickname || user?.username || "名無し"}
                </Typography>
              </Box>
            </Box>

            {/* 編集ボタン */}
            {!isEditing && (
              <Button
                variant="secondary"
                onClick={toggleEditMode}
                sx={{ height: 35, width:80, mt:7}}
              >
                <Typography variant="body2" sx={{ color: "primary.main", fontSize:15 }}>編集</Typography>
              </Button>
            )}
          </Box>

          {/* 自己紹介 */}
          <Box>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              {user?.bio || "自己紹介がありません"}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
