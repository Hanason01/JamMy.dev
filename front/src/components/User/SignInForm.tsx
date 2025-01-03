"use client";

import { LoginFormData } from "@sharedTypes/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, FormControlLabel, Checkbox, Button, Divider, Alert } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from "@mui/icons-material/Google";
import { PasswordField } from "@User/PasswordField";

import { useSignInValidation } from "@validation/useSignInValidation";
import { useSignInRequest } from "@services/user/useSignInRequest";
import { useAuthContext } from "@context/useAuthContext";

export function SignInForm({redirectTo} : {redirectTo:string}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const { isAuthenticated } = useAuthContext();

  const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);

  const { register, handleSubmit, setError, errors } = useSignInValidation();

  const { signIn } = useSignInRequest();
  const sendDataToAPI = async (data: LoginFormData) => {
    try {
      await signIn(data);
      // redirectTo の値をログに出力
      console.log("Redirecting to:", redirectTo);
      console.log("signInが終わった後のisAuthenticated", isAuthenticated);

      sessionStorage.removeItem("redirectTo");

      // router.push の前後でログを追加
      if (redirectTo) {
        console.log("Navigating to redirectTo:", redirectTo);
        window.location.href = redirectTo;
        // await router.push(redirectTo);
        console.log("Navigation to redirectTo completed successfully:", redirectTo);
      } else {
        console.log("No redirectTo provided, navigating to default /projects");
        window.location.href = "/projects?refresh=true";
        // await router.push("/projects?refresh=true");
        console.log("Navigation to default /projects completed successfully");
      }

    } catch (error: any) {
      if (error.email) {
        setError("email", { type: "manual", message: error.email });
      } else if (error.password) {
        setError("password", { type: "manual", message: error.password });
      } else {
        // 他の特定フィールドでのエラーがない場合、フォーム全体に対するエラーメッセージを設定
        setFormError(error.general);
      }
      console.log("sendDataToAPIが終わった後のisAuthenticated", isAuthenticated);
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
      <Button variant="outlined" startIcon={<GoogleIcon />} fullWidth >
      SIGN IN WITH GOOGLE
      </Button>
      <Divider variant="fullWidth">or</Divider>

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
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt:2}}>
          ログインする
        </Button>
      </Box>
    </Box>
  );
}