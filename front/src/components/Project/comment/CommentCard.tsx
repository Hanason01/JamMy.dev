"use client";

import { User,EnrichedComment, GetKeyType,EnrichedProject } from "@sharedTypes/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Avatar, Typography, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,Divider } from "@mui/material";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteIcon from "@mui/icons-material/Delete";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useCommentToggle } from "@services/project/feedback/useCommentToggle";
import { useProjectComments } from "@swr/useCommentSWR";

export function CommentCard({
  comment,
  onReply,
  projectId,
  project,
  getKey,
}: {
  comment: EnrichedComment;
  onReply: (commentId: string) => void;
  projectId: string;
  project: EnrichedProject;
  getKey: GetKeyType;
}){
  // SWR関連
  const { mutate } = useProjectComments(projectId); //コメント

  // 状態管理
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const { attributes, user, isOwner } = comment;

  //フック
  const { handleUnComment } = useCommentToggle();

  // コメント作成日時を相対時間で表示
  const createdAt = new Date(attributes.created_at);
  const formattedDate = formatDistanceToNow(createdAt, { addSuffix: true, locale: ja });

  const router = useRouter();

  //ユーザーページ遷移
  const handleClickAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem("scrollPosition");

    if (isOwner) {
      router.push("/mypage");
    } else {
      router.push(`/other_users/${user.id}`);
    }
  };

  // ダイアログの確認後の処理（削除）
  const handleDialogConfirmDelete = () => {
    handleDeleteComment();
    setOpenDeleteDialog(false);
  };

  // 削除処理の中間関数
  const handleDeleteProxy = () => {
    setOpenDeleteDialog(true);
  };

  //削除ボタン
  const handleDeleteComment = async () =>{
    await handleUnComment(projectId, comment.attributes.id, getKey)
    mutate(); //コメントのSWR
  }

  return (
    <Box
      sx={{
        borderBottom: "1px solid #ddd",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {/* ユーザー情報とタイムスタンプ */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={
              user.attributes.avatar_url
                ? `/api/proxy-image?key=${encodeURIComponent(user.attributes.avatar_url)}`
                : "/default-icon.png"
            }
            alt={user.attributes.nickname || "名無しのユーザー"}
            onClick={handleClickAvatar} />
          <Box sx={{ ml: 2 }}>
            <Typography
            variant="body1"
            component="span"
              color="textPrimary"
              onClick={handleClickAvatar}
              sx={{
                cursor: "pointer",
                textDecoration: "none",
                transition: "text-decoration 0.2s ease-in-out",
                "&:hover": { textDecoration: "underline" },
                "&:active": { textDecoration: "underline" },
              }}
            >
              {user.attributes.nickname || user.attributes.username || "名無しのユーザー"}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
          <Typography variant="body2" color="textSecondary">
          {formattedDate}
          </Typography>
          {isOwner && (
            <IconButton size="small" onClick={handleDeleteProxy}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}

          {/* 削除用ダイアログ */}
          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
            <DialogContent>
              <DialogContentText>
                コメントを削除しますか？
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{justifyContent: "center", mb:1}} >
              <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
                キャンセル
              </Button>
              <Button onClick={handleDialogConfirmDelete} variant="contained" color="warning">
                削除
              </Button>
            </DialogActions>
          </Dialog>

        </Box>

      </Box>

      {/* コメント内容 */}
      <Typography variant="body2" sx={{ my: 1, mx:1 }}>
        {attributes.content}
      </Typography>

      {/* 返信*/}
      {/* <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}> */}
        {/* <IconButton size="small" onClick={() => onReply(comment.id)}>
          <ChatBubbleOutlineIcon fontSize="small" />
        </IconButton> */}
      {/* </Box> */}
    </Box>
  );
}
