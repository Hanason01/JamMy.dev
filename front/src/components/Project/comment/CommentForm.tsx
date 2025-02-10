"use client";

import { PostCommentFormData} from "@sharedTypes/types";
import { Box, TextField, IconButton, Paper, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState, useRef, useEffect } from "react";
import { useCommentRequest } from "@services/project/feedback/useCommentRequest";
import { usePostCommentValidation } from "@validation/usePostCommentValidation";
import { useClientCacheContext } from "@context/useClientCacheContext";
import { useAuthContext } from "@context/useAuthContext";
import { useProjectComments } from "@swr/useCommentSWR";
import { useSWRConfig } from "swr";
// import { useProjectList } from "@services/swr/useProjectSWR";

export function CommentForm({
  projectId
  } : {
  projectId: string;
  }) {
  // SWR関連
  const { mutate } = useProjectComments(projectId); //コメント
  // const { mutate: indexMutate } = useProjectList(); //一覧
  const { mutate: globalMutate } = useSWRConfig()
  const detailMutateKey = `/api/projects/${projectId}`;

  // フック
  const { postCommentProject } = useCommentRequest();
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
      await postCommentProject(data, projectId);
      reset();
      mutate(); //コメントのSWR
      globalMutate(detailMutateKey);
      // indexMutate(undefined, {revalidate: true}); //一覧SWR
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
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        padding: 1,
        backgroundColor: "#fff",
        zIndex: 1100,
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
