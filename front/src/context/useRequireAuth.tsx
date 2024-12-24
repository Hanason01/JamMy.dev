"use client";

import { useAuthContext } from "@context/useAuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequireAuth(): boolean {
  const { isAuthenticated, openAuthModal } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      console.warn("未認証状態です。ログイン画面へリダイレクトします。");

      // 遷移しようとしたURLを保存する
      const currentPath = window.location.pathname;
      sessionStorage.setItem("redirectTo", currentPath);

      openAuthModal();
      router.replace("/auth");
    }
  }, [isAuthenticated, openAuthModal, router]);

  return isAuthenticated;
}
