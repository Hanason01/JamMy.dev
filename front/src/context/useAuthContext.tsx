"use client";

import { User, AuthContextType, WithChildren } from "@sharedTypes/types";
import React, { createContext, useState, useContext, useEffect } from "react";

// 初期値を設定
const initialContext: AuthContextType = {
  authenticatedUser: null,
  isAuthenticated: false,
  showAuthModal: false,
  handleLoginSuccess: async () => {},
  handleLogout: () => {},
  hasAuthenticated: () => {},
  handleAuthError: () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signIn: () => false,
  requireAuth: () => false,
};

const AuthContext = createContext<AuthContextType>(initialContext);

export const AuthProvider = ({ children }: WithChildren) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  console.log("AuthProviderでisAuthenticatedを追跡",isAuthenticated);

  //初期化
  useEffect(() => {
    const storedUser = localStorage.getItem("authenticatedUser");
    if (storedUser) {
      setAuthenticatedUser(JSON.parse(storedUser) as User);
      setIsAuthenticated(true);
    }
    console.log("Authenticatedの初期化をcontextで行う");
  }, []);

  //ログイン成功時の関数
  const handleLoginSuccess = async (user: User):Promise<void> => {
    localStorage.setItem("authenticatedUser", JSON.stringify(user));
    setIsAuthenticated(true);
    setAuthenticatedUser(user);
    closeAuthModal();
  };

   // ログアウト処理
  const handleLogout = ():void => {
   // ローカルストレージをクリア
    localStorage.removeItem("authenticatedUser");
    setIsAuthenticated(false);
    setAuthenticatedUser(null);
  };

  // モーダル開閉の関数
  const openAuthModal = (): void => setShowAuthModal(true);
  const closeAuthModal = (): void => setShowAuthModal(false);

  // 認証状態を更新する関数
  const hasAuthenticated = (): void => {
    setIsAuthenticated(true);
    closeAuthModal();
  };

  // 認証エラー時の処理
  const handleAuthError = (): void => {
    setIsAuthenticated(false);
    openAuthModal();
  };

  // ログイン判定のみ行う関数
  const signIn = (): boolean => {
    return localStorage.getItem("authenticatedUser") !== null;
  };

  // ログインしていなければ認証モーダルを開く関数
  const requireAuth = (): boolean => {
    if (!signIn()) {
      openAuthModal();
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        authenticatedUser,
        isAuthenticated,
        showAuthModal,
        handleLoginSuccess,
        handleLogout,
        hasAuthenticated,
        handleAuthError,
        openAuthModal,
        closeAuthModal,
        signIn,
        requireAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
