"use client";

import { PostCommentFormData, GetKeyType} from "@sharedTypes/types";
import { Box, TextField, IconButton, Paper, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState, useRef, useEffect } from "react";
import { usePostCommentValidation } from "@validation/usePostCommentValidation";
import { useClientCacheContext } from "@context/useClientCacheContext";
import { useAuthContext } from "@context/useAuthContext";
import { useCommentToggle } from "@services/project/feedback/useCommentToggle";
import { useProjectComments } from "@swr/useCommentSWR";
import { useSWRConfig } from "swr";

export function CommentForm({
  projectId,
  getKey
  } : {
  projectId: string;
  getKey: GetKeyType;
  }) {
  // SWR関連
  const { mutate } = useProjectComments(projectId); //コメント

  // フック
  const { handleCreateComment } = useCommentToggle();
  const { register, handleSubmit, setError, reset, errors } = usePostCommentValidation();

  // 状態管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null); //コメントフォームfocusチェック

  // context
  const { isCommentRoute, setIsCommentRoute } = useClientCacheContext();
  const { requireAuth, openAuthModal } = useAuthContext();

  //コメント遷移処理
  useEffect(() => {
    if (isCommentRoute) {
      const input = document.getElementById("comment-input");
      input?.focus();
      setIsCommentRoute (false); // フォーカス後にリセット
    }

    return () => {
      setIsCommentRoute (false);
    }
  }, [isCommentRoute]);

  //コメント入力focus時にログイン判定
  useEffect(() => {
    const inputElement = inputRef.current; //TextfieldのDOM取得

    if (inputElement) {
      inputElement.addEventListener("focus", handleFocus); //focusと同時にログイン判定
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("focus", handleFocus);
      }
    };
  }, []);

  // フォーカス時の認証チェック
  const handleFocus = () => {
    if (!requireAuth()) {
      openAuthModal();
      inputRef.current?.blur(); //モーダルを開いたらfocusを解除
    }
  };

  //コメント投稿処理
  const onSubmit = async (data: PostCommentFormData) => {
    setIsSubmitting(true);
    try {
      await handleCreateComment(data, projectId, getKey);
      reset();
      mutate(); //コメントのSWR
    } catch (error: any) {
      setError("content", { type: "manual", message: error.content });
      console.error("コメント送信エラー:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 56,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        padding: 1,
        backgroundColor: "#fff",
        zIndex: 1100,
        width: "100%",
        maxWidth: "800px"
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexGrow: 1, alignItems: "center" }}
      >
        <TextField
          id="comment-input"
          inputRef={inputRef}
          {...register("content")}
          placeholder="コメントを入力..."
          variant="outlined"
          multiline
          maxRows={4}
          fullWidth
          disabled={isSubmitting}
          error={!!errors.content}
          helperText={errors.content?.message}
          sx={{ mr: 1 }}
        />
        {isSubmitting ? (
          <CircularProgress
            size={48}
            sx={{
              color: "primary",
            }}
          />
        ) : (
        <IconButton type="submit" color="primary">
          <SendIcon />
        </IconButton>
        )}
      </Box>
    </Paper>
  );
}
