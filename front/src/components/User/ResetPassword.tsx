"use client";
import { ResetPasswordFormData, SignUpRequestData } from "@sharedTypes/types";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { TextField, Button, Alert, Typography, Box, Container } from "@mui/material";
import { useResetPasswordValidation } from "@validation/useResetPasswordValidation";
import { PasswordField } from "@User/PasswordField";
import { useAuthContext } from "@context/useAuthContext";

export const ResetPassword = () => {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("reset_password_token");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const { register, handleSubmit, setError: setValidationError, errors } = useResetPasswordValidation();
  const { handleLoginSuccess } = useAuthContext();

  const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);
  const handleTogglePasswordConfirmationVisibility = () =>
    setShowPasswordConfirmation(!showPasswordConfirmation);

  //devise_token_auth : editアクション
  useEffect(() => {
    const resetPasswordInit = async () => {
      if (!resetToken) {
        setError("正しいリンクからの遷移ではありません。");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/password/edit`,
          {
            params: { reset_password_token: resetToken, },
          }
        );
        setIsTokenValid(true);
      } catch (error) {
        setIsTokenValid(false);
        setError("パスワードリセットのリクエストに失敗しました。");
      }
    };

    if (resetToken) {
      resetPasswordInit();
    } else {
      setError("正しいリンクからの遷移ではありません。");
    }
  }, []);

  //Devise_token_auth: updateアクション
  const resetPasswordRequest = async (data: ResetPasswordFormData) => {
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/auth/password`, {
        reset_password_token: resetToken,
        password: data.password,
        password_confirmation: data.confirmPassword,
      },{withCredentials: true});

      handleLoginSuccess(response.data.data);
      setMessage("パスワードがリセットされました。");
      setError(null);
      window.location.href = "/projects?refresh=true";
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setValidationError("password", {
          type: "manual",
          message: err.response.data.errors[0] || "パスワードリセットに失敗しました。",
        });
      } else {
        setError("パスワードリセットに失敗しました。");
      }
    }
  };

  // トークンが無効の場合のメッセージ
  if (!isTokenValid && error) {
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
          <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
            パスワードリセットエラー
          </Typography>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  //フォーム
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
        <Typography variant="h5" component="h1" gutterBottom sx={{mb:3}}>
          パスワードリセット
        </Typography>
        {message && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}
        <form onSubmit={handleSubmit(resetPasswordRequest)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          <PasswordField
            label="新しいパスワード"
            placeholder="英数字8文字以上"
            showPassword={showPassword}
            onToggleVisibility={handleTogglePasswordVisibility}
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <PasswordField
            label="パスワード確認"
            placeholder="英数字8文字以上"
            showPassword={showPasswordConfirmation}
            onToggleVisibility={handleTogglePasswordConfirmationVisibility}
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            パスワードをリセット
          </Button>
        </form>
      </Box>
    </Container>
  );
};
