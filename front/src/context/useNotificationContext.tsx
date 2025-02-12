"use client";

import { useState, createContext, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "@context/useAuthContext";


interface NotificationContextType {
  hasUnread: boolean;
  refreshUnreadStatus: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  hasUnread: false,
  refreshUnreadStatus: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { signIn, isAuthenticated } = useAuthContext();
  const [hasUnread, setHasUnread] = useState<boolean>(false);

  // 未読状態の取得
  const fetchUnreadStatus = useCallback(async () => {
    if (!signIn()) return;

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/has_unread`, { withCredentials: true });
      setHasUnread(response.data.has_unread);
      console.log("未読状態:", response.data.hasUnread);
    } catch (error) {
      console.error("通知の未読状態の取得に失敗しました:", error);
    }
  }, [signIn]);

  useEffect(() => {
    fetchUnreadStatus();
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{
      hasUnread,
      refreshUnreadStatus: fetchUnreadStatus
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
