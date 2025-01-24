"use client";
import { useSearchParams } from "next/navigation";
import { Box, Typography } from "@mui/material";

export const AuthPending = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  return (
    <Box textAlign="center" sx={{mt:8, mx:2}}>
      <Typography variant="h5" gutterBottom>
        JamMyへご登録ありがとうございます！
      </Typography>
      <Typography>
        以下のメールアドレスに認証リンクを送信しました
      </Typography>
      <Typography variant="h6" color="primary" mt={2}>
        {email}
      </Typography>
      <Typography mt={3}>
        メールを確認し、アカウントを有効化してください。
      </Typography>
    </Box>
  );
};

