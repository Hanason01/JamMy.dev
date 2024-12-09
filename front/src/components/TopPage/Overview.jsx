"use client";

import { useRouter } from "next/navigation";
import { Typography, Button, Box } from "@mui/material";
import { useAuthContext } from "../../context/useAuthContext";

export function Overview(){
  const router = useRouter();
  const { openAuthModal } = useAuthContext();

  const handleNavigateToProjects = () => {
    router.push("/projects");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        gap: 2,
      }}
      >
        <Typography variant="h4">~JamMyとは~</Typography>
        <Typography variant="h6">アプリ説明文</Typography>
        <Box
          sx={{
            display: "flex",
            py: 2,
            gap: 2,
          }}
          >
          <Button variant="secondary" onClick={handleNavigateToProjects}>
            投稿を見る
          </Button>
          <Button variant="secondary" onClick={openAuthModal}>
            ログインする
          </Button>
        </Box>
      </Box>
  );
}