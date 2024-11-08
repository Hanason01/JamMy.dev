"use client";

import { useState } from "react";
import { Typography, Button, Box } from "@mui/material";
import { AuthModal } from "../User/AuthModal";

export function Overview(){
  const [openAuthModal, setOpenAuthModal] = useState(false);

  const handleOpenAuthModal = () => {
    setOpenAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setOpenAuthModal(false);
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
          <Button variant="secondary">
            投稿を見る
          </Button>
          <Button variant="secondary" onClick={handleOpenAuthModal}>
            ログインする
          </Button>
        </Box>
        <AuthModal open={openAuthModal} handleClose={handleCloseAuthModal} />
      </Box>
  );
}