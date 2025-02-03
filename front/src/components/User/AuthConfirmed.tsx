"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "@context/useAuthContext";
import axios from "axios";

export const AuthConfirmed = () => {
  const searchParams = useSearchParams();
  const { handleLoginSuccess } = useAuthContext();

  const [isLoading, setIsLoading] = useState(true); // ローディング状態
  const [isSuccess, setIsSuccess] = useState(false); // 成功状態
  const [userEmail, setUserEmail] = useState<string | null>(null); //再送先メールアドレス
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    const confirmAccount = async () => {
      const confirmationToken = searchParams.get("confirmation_token");

      // トークンがない場合はエラー画面へリダイレクト
      if (!confirmationToken) {
        alert("認証トークンが見つかりません。");
        setIsLoading(false);
        return;
      }

      try {
        //メール認証リクエスト
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/confirmation`,
          {
            params: { confirmation_token: confirmationToken },
            withCredentials: true,
          }
        );

        // 認証成功時
        if (response.data.success) {
          handleLoginSuccess(response.data.user);
          setIsSuccess(true);

        } else {
          alert("認証に失敗しました。");
        }
      } catch (error: any) {
        if (error.response?.status === 422) {
          setUserEmail(searchParams.get("email"));
        }
        alert("エラーが発生しました。もう一度お試しください。");
      } finally {
        setIsLoading(false);
      }
    };

    confirmAccount();
  }, []);

  const resendConfirmationEmail = async () => {
    if (!userEmail) return;

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/confirmation`, {
        email: userEmail,
        redirect_url: "https://www.jam-my.com/auth/confirmed",
      });
      setResendMessage("確認メールを再送しました。メールをご確認ください。");
    } catch (error) {
      setResendMessage("確認メールの再送に失敗しました。");
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" sx={{mt:8, mx:2}}>
        <CircularProgress />
        <Typography variant="h5" mt={3}>
          アカウントを確認中...
        </Typography>
        <Typography>しばらくお待ちください。</Typography>
      </Box>
    );
  }

  if (isSuccess) {
    return (
      <Box textAlign="center" sx={{mt:8, mx:2}}>
        <Typography variant="h5" gutterBottom>
          アカウントが有効化されました！
        </Typography>
        <Typography>JamMyをお楽しみください！</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => (window.location.href = "/projects")}
        >
          投稿一覧を見る
        </Button>
      </Box>
    );
  }

  return (
    <Box textAlign="center" sx={{mt:8, mx:2}} >
      <Typography variant="h5" color="error" gutterBottom>
        アカウントの有効化に失敗しました
      </Typography>
      <Typography>再度お試しください。</Typography>
      {userEmail && (
        <Box mt={3}>
          <Typography>認証トークンが期限切れの可能性があります。</Typography>
          <Button variant="contained" color="primary" onClick={resendConfirmationEmail}>
            確認メールを再送する
          </Button>
          {resendMessage && (
            <Alert severity={resendMessage.includes("失敗") ? "error" : "success"} sx={{ mt: 2 }}>
              {resendMessage}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};