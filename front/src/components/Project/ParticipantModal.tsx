"use client";

import { CollaborationUser, SetState } from "@sharedTypes/types";
import { Modal, Box, Avatar, Typography, List, ListItem, ListItemAvatar, ListItemText, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";


export const ParticipantModal = ({
  isOpenParticipantModal,
  setIsOpenParticipantModal,
  participants
} : {
  isOpenParticipantModal: boolean;
  setIsOpenParticipantModal: SetState<boolean>;
  participants: CollaborationUser[];
}) => {
  const router = useRouter();

  const handleUserClick = (userId: number) => {
    router.push(`/other_users/${userId}`);
    setIsOpenParticipantModal(false);
  };

  return (
    <Modal
    open={isOpenParticipantModal}
    onClick={(event) => {
      event.stopPropagation();
      setIsOpenParticipantModal(false);
    }}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    >
      <Box
        sx={{
          backgroundColor: "background.default",
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: 24,
          width: "90%",
          p: 3,
          mx: "auto",
          my: "5%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* ヘッダー */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">参加者リスト</Typography>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              setIsOpenParticipantModal(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 参加者リスト */}
        <List>
          {participants.map((user) => (
            <ListItem
            key={user.user_id}
            component="div"
            sx={{ cursor: "pointer" }}
            onClick={(event) => {
              event.stopPropagation();
              handleUserClick(user.user_id);
            }}
            >
              <ListItemAvatar>
                <Avatar
                src={
                  user.avatar_url
                    ? `/api/proxy-image?key=${encodeURIComponent(user.avatar_url)}`
                    : "/default-avatar.png"
                }
                />
              </ListItemAvatar>
              <ListItemText primary={user.nickname || user.username || "名無しのユーザー"} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Modal>
  );
};
