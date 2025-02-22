"use client";

import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { useEffect } from "react";
import { NotificationList } from "@Notification/NotificationList";
import { useNotifications } from "@swr/useNotificationsSWR";
import { useNotificationContext } from "@context/useNotificationContext";
import { useRevalidateSWR } from "@utils/useRevalidateSWR";
import { PullToRefresh } from "@components/PullToRefresh";


export const NotificationListWrapper = () => {
  const { hasUnread, setHasUnread } = useNotificationContext();
  const { notifications, isLoading, isValidating, isError, mutate } = useNotifications();
  const { updateNotifications } = useRevalidateSWR();

  //未読があれば再フェッチ
  useEffect(() => {
    if ( hasUnread ) {
      mutate(undefined, { revalidate: true });
      setHasUnread(false);
    }
  }, []);


  if (isError) {
    return (
      <Box sx={{ mx: 2, my: 4 }}>
        <Alert severity="error">通知の取得に失敗しました。</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: "56px" }}>
      <PullToRefresh onRefresh={updateNotifications} />
      {isValidating || isLoading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h6" color="textSecondary">
            通知はありません。
          </Typography>
        </Box>
      ) : (
        <Box>
          {notifications.map((notification) => (
            <NotificationList key={notification.id} notification={notification} />
          ))}
        </Box>
      )}
    </Box>
  );
};
