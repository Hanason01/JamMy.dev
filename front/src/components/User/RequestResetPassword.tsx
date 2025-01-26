"use client";
import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Alert, Typography, Box, Container } from "@mui/material";

export const RequestResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/password`, { email });
      setMessage("リセットリンクをメールに送信しました。メールをご確認の上、パスワードの変更をしてください");
      setError(null);
    } catch (err) {
      setError("リセットリンクの送信に失敗しました。もう一度お試しください。");
      setMessage(null);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        sx={{
          textAlign: "center",
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          パスワードリセット
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          登録済みのメールアドレスを入力してください。リセットリンクをお送りします。
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 2,
          }}
        >
          <TextField
            label="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            リセットリンクを送信
          </Button>
        </Box>
        {message && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  );
};
