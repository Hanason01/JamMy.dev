"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { UserAttributes } from "@sharedTypes/types";
import {Box, Avatar, IconButton, Button, Typography, CircularProgress} from "@mui/material";


export function UserProfile(
  {user_id} : {user_id: string}) {
  const [user, setUser] = useState<UserAttributes | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  //  ユーザープロフィール初期化
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/user_profiles/${user_id}`
        );
        const data = res.data;
        setUser(data.data.attributes)
        setAvatar(data.avatar_url);
      } catch (error) {
        console.error("ユーザープロフィール取得に失敗しました", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

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
        <>
          {/* アバター + 名前 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar
              src={
                avatar
                  ? `/api/proxy-image?key=${encodeURIComponent(avatar)}`
                  : "/default-avatar.png"
              }
              sx={{
                width: 80,
                height: 80,
              }}
            />
            {/* 名前 */}
            <Box>
              <Typography variant="h5">
                {user?.nickname || user?.username || "名無し"}
              </Typography>
            </Box>
          </Box>

          {/* 自己紹介 */}
          <Box>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              {user?.bio || "自己紹介がありません"}
            </Typography>
          </Box>
        </>
    </Box>
  );
}
