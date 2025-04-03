"use client";
import { User } from "@sharedTypes/types";
import { useEffect } from "react";
import axios,{ AxiosResponse } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgress, Typography, Box } from "@mui/material";
import { useAuthContext } from "@context/useAuthContext";

export const GoogleCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { handleLoginSuccess } = useAuthContext();

  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      console.error("Google認証エラー:", error);
      alert("Google認証に失敗しました。再度お試しください。");
      router.push("/auth");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response: AxiosResponse<{ data: User }> = await axios.get( `${process.env.NEXT_PUBLIC_API_URL}/auth/validate_token`,{withCredentials: true});

        handleLoginSuccess(response.data.data);
        router.push("/projects?feedback=signin:success")
      } catch (error: any) {
        console.error("認証エラーが発生しました:", error);
        alert("認証データの読み取りに失敗しました。再度お試しください。");
        router.push("/auth");
      }
    };
    fetchUserData();
  }, []);

  return(
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
};