"use client";

import { useState, createContext, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "@context/useAuthContext";


interface NotificationContextType {
  hasUnread: boolean;
  setHasUnread: (value: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  hasUnread: false,
  setHasUnread: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { signIn, isAuthenticated } = useAuthContext();
  const [hasUnread, setHasUnread] = useState<boolean>(false);

  // 初回アクセス時の未読状態の取得
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

  // 未読状態の取得(認証状態が変われば発動)
  useEffect(() => {
    fetchUnreadStatus();
  }, [isAuthenticated]);


  // // SSE（リアルタイム通知）をリッスン
  // useEffect(() => {
  //   console.log("🟡 SSE useEffect 発火: isAuthenticated =", isAuthenticated);
  //   if (!isAuthenticated) return;

  //   console.log("🔍 SSE 接続開始");
  //   const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/stream`, { withCredentials: true });
  //   console.log("🛠 EventSource インスタンス:", eventSource);
  //   eventSource.onopen = () => {
  //     console.log("✅ SSE 接続確立: readyState =", eventSource.readyState);
  //   };

  //   eventSource.onmessage = (event) => {
  //     console.log("📩 フロントが受信:", event.data);
  //     try {
  //       const parsedData = JSON.parse(event.data);
  //       if (parsedData.event === "connection_established") {
  //         console.log("✅ SSE 接続成功:", parsedData.data);
  //       } else if (parsedData.event === "new_notification") {
  //         console.log("📩 新しい通知:", parsedData.data);
  //         setHasUnread(true);
  //       }
  //     } catch (error) {
  //       console.error("❌ JSON パースエラー:", error, event.data);
  //     }
  //   };

  //   eventSource.onerror = (error) => {
  //     console.error("❌ SSE エラー:", error, "readyState =", eventSource.readyState);
  //     eventSource.close();
  //   };

  //   return () => {
  //     console.log("🔴 SSE 接続終了");
  //     eventSource.close();
  //   };
  // }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{
      hasUnread, setHasUnread
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
