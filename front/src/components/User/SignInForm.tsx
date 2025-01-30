"use client";

import { LoginFormData } from "@sharedTypes/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Box, TextField, FormControlLabel, Checkbox, Button, Divider, Alert, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import GoogleIcon from "@mui/icons-material/Google";
import { PasswordField } from "@User/PasswordField";
import { useSignInValidation } from "@validation/useSignInValidation";
import { useSignInRequest } from "@services/user/useSignInRequest";
import { useGoogleSignIn } from "@services/user/useGoogleSignIn"



export function SignInForm({redirectTo} : {redirectTo?:string}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);

  const { register, handleSubmit, setError, errors } = useSignInValidation();
  const { signInWithGoogle } = useGoogleSignIn();

  const { signIn } = useSignInRequest({redirectTo});
  const sendDataToAPI = async (data: LoginFormData) => {

    try {
      await signIn(data);

    } catch (error: any) {
      if (error.email) {
        setError("email", { type: "manual", message: error.email });
      } else if (error.password) {
        setError("password", { type: "manual", message: error.password });
      } else {
        // 他の特定フィールドでのエラーがない場合、フォーム全体に対するエラーメッセージを設定
        setFormError(error.general);
      }
    }
  };


  return (
    <Box
    component= "form"
    onSubmit={handleSubmit(sendDataToAPI)}
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "80%",
      gap: 3,
      my: 3,
    }}>
      {formError && <Alert severity="error">{formError}</Alert>}
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          backgroundColor: "primary.main",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderColor: "primary.main",
        }}
      >
        <LockIcon
          sx={{
            fontSize: 35,
            color: "background.default",
          }}
        />
      </Box>
      <Button
      variant="outlined"
      startIcon={<GoogleIcon />}
      fullWidth
      onClick={signInWithGoogle}
      >
      SIGN IN WITH GOOGLE
      </Button>
      <Box sx={{width: "100%", display: "flex", alignItems: "center"}}>
        <Divider sx={{ flex: 1, my: 1 }}/>
        <Typography sx={{ mx: 2 }}>or</Typography>
        <Divider sx={{ flex: 1, my: 1 }} />
      </Box>

      <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        width: "100%"
      }}>
        <TextField
        label="メールアドレス"
        variant="outlined"
        placeholder="example@gmail.com"
        fullWidth
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
        />
        <PasswordField
          label="パスワード"
          placeholder="英数字8文字以上"
          showPassword={showPassword}
          onToggleVisibility={handleTogglePasswordVisibility}
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <FormControlLabel
          control={<Checkbox {...register("remember_me")} />}
          label="ログイン状態を保持する"
        />
        <Typography
          variant="body2"
          color="primary"
          sx={{
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          component={Link}
          href="/auth/request_reset_password"
        >
          パスワードをお忘れですか？
        </Typography>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt:2}}>
          ログインする
        </Button>

      </Box>
    </Box>
  );
}