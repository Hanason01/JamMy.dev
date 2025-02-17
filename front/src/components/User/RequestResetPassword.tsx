"use client";
import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Alert, Typography, Box, Container, CircularProgress } from "@mui/material";

export const RequestResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/password`, { email });
      setMessage("再設定用リンクをメールに送信しました。ご確認の上、パスワードの変更をしてください");
      setError(null);
    } catch (err) {
      setError("再設定用リンクの送信に失敗しました。もう一度お試しください。");
      setMessage(null);
    } finally {
      setLoading(false);
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
          パスワード再設定用リンクを送信します。ご登録のメールアドレスを入力してください。
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "メールアドレスに送信"}
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
