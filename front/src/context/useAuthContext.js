"use client";

import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  //ログイン成功時の関数
  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setAuthenticatedUser(user);
    // ローカルストレージに保存
    localStorage.setItem('authenticatedUser', JSON.stringify(user));
    closeAuthModal();
  };

   // ログアウト処理
  const handleLogout = () => {
    console.log("handleLogoutが呼び出された");
   // ローカルストレージをクリア
    localStorage.removeItem('authenticatedUser');
    setIsAuthenticated(false);
    setAuthenticatedUser(null);
  };

  // モーダル開閉の関数
  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  // 認証状態を更新する関数
  const hasAuthenticated = () => {
    setIsAuthenticated(true);
    closeAuthModal();
  };

  // 認証エラー時の処理
  const handleAuthError = () => {
    setIsAuthenticated(false);
    openAuthModal();
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);