"use client";

import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { NotificationList } from "@Notification/NotificationList";
import { useNotifications } from "@swr/useNotificationsSWR";


export const NotificationListWrapper = () => {
  const { notifications, isLoading, isValidating, isError } = useNotifications();
  console.log("notifications", notifications);

  if (isError) {
    return (
      <Box sx={{ mx: 2, my: 4 }}>
        <Alert severity="error">通知の取得に失敗しました。</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: "56px" }}>
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
