"use client";

import { LoginFormData } from "@sharedTypes/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReactElement } from "react";
import { Box, TextField, FormControlLabel, Checkbox, Button, Divider, Alert, Typography, CircularProgress } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { PasswordField } from "@User/PasswordField";
import { useSignInValidation } from "@validation/useSignInValidation";
import { useSignInRequest } from "@services/user/useSignInRequest";
import { useGoogleSignIn } from "@services/user/useGoogleSignIn"
import { useAuthContext } from "@context/useAuthContext";



export function SignInForm({
  redirectTo,
  GoogleSVGIcon
  } : {
  redirectTo?:string
  GoogleSVGIcon: ReactElement;
  }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);

  const { register, handleSubmit, setError, errors } = useSignInValidation();
  const { signInWithGoogle } = useGoogleSignIn();
  const { closeAuthModal } = useAuthContext();

  const { signIn } = useSignInRequest({redirectTo});
  const sendDataToAPI = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await signIn(data);

    } catch (error: any) {
      if (error.email) {
        setError("email", { type: "manual", message: error.email });
      } else if (error.password) {
        setError("password", { type: "manual", message: error.password });
      } else {
        setFormError(error.general);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = () => {
    closeAuthModal();
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
      startIcon={GoogleSVGIcon}
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
        gap: 2,
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
          onClick={handlePasswordReset}
        >
          パスワードをお忘れですか？
        </Typography>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            mt: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1
          }}
          disabled={loading}
        >
          ログインする
          {loading && <CircularProgress size={24} sx={{ color: "white", ml: 1 }} />}
        </Button>
      </Box>
    </Box>
  );
}