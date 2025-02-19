"use client";
import { Notification } from "@sharedTypes/types";
import { Box, Avatar, Typography, Divider, ButtonBase } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface Props {
  notification: Notification;
}

export const NotificationList = ({ notification }: Props) => {
  const router = useRouter();

  const handleNotificationClick = () => {
    router.push(`/projects/${notification.notifiable.project_id}/project_show`);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 2,
          cursor: "pointer",
        }}
        onClick={handleNotificationClick}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ButtonBase
            sx={{
              borderRadius: "50%",
              overflow: "hidden",
              transition: "transform 0.2s ease-in-out",
              "&:active": { transform: "scale(0.8)" },
            }}
          >
            <Avatar
            src={
              notification.sender?.avatar_url
                ? `/api/proxy-image?key=${encodeURIComponent(notification.sender.avatar_url)}`
                : "/default-icon.png"
            }
            />
          </ButtonBase>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body1">{notification.message}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ja })}「{notification.notifiable.project_title}」
            </Typography>
          </Box>
        </Box>
        <ChevronRightIcon color="action" />
      </Box>
      <Divider />
    </>
  );
};
