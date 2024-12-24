"use client";

import { SignUpFormData, SignUpRequestData } from "@sharedTypes/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, Divider, Alert } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GoogleIcon from "@mui/icons-material/Google";
import { PasswordField } from "@User/PasswordField";

import { useSignUpValidation } from "@validation/useSignUpValidation";
import { useSignUpRequest } from "@services/user/useSignUpRequest";

export function SignUpForm({redirectTo}: {redirectTo:string}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);
  const handleToggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const { register, handleSubmit, setError, errors } = useSignUpValidation();

  const { signUp } = useSignUpRequest();
  const sendDataToAPI = async (data: SignUpFormData) => {
    const { confirmPassword, ...filteredData } = data;
    const requestData: SignUpRequestData = filteredData as SignUpRequestData;
    try {
      await signUp(requestData);

      sessionStorage.removeItem("redirectTo");

      if (redirectTo){
        router.push(redirectTo);
      }else{
        router.push("/projects?refresh=true");
      }
    } catch (error: any) {
    if (error.email) {
        setError("email", { type: "manual", message: error.email });
      } else if (error.password) {
        setError("password", { type: "manual", message: error.password });
      } else if (error.nickname) {
        setError("username", { type: "manual", message: error.username });
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
        <PersonAddIcon
          sx={{
            fontSize: 35,
            color: "background.default",
          }}
        />
      </Box>
      <Button variant="outlined" startIcon={<GoogleIcon />} fullWidth >
      SIGN UP WITH GOOGLE
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
        <TextField
        label="ユーザーネーム"
        variant="outlined"
        placeholder="15文字以内"
        fullWidth
        {...register("username")}
        error={!!errors.username}
        helperText={errors.username?.message}
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
        <PasswordField
          label="パスワード確認"
          placeholder="英数字8文字以上"
          showPassword={showConfirmPassword}
          onToggleVisibility={handleToggleConfirmPasswordVisibility}
          {...register("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt:2}}>
          登録する
        </Button>
      </Box>
    </Box>
  );
}