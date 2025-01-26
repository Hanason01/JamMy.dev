"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, Snackbar } from "@mui/material";
import { useFeedbackContext } from "@context/useFeedbackContext";

export const FeedbackAlert: React.FC = () => {
  const { feedback, setFeedbackByKey, clearFeedback } = useFeedbackContext();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    //context経由であれば既に下記returnに代入済の為、離脱
    if (feedback.open) return;

    // URLから feedbackのparams を取得
    const feedbackKey = searchParams.get("feedback");
    if (feedbackKey) {
      setFeedbackByKey(feedbackKey);

      // クエリを削除してURLをリセット（再表示防止）
      const params = new URLSearchParams(searchParams.toString());
      params.delete("feedback");

      router.replace(`?${params.toString()}`);
    }

    return () => {
      clearFeedback();
    };
  },[])

  if (!feedback.open) return null;

  return (
    <Snackbar
      open={feedback.open}
      autoHideDuration={6000}
      onClose={clearFeedback}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{
        top: "56px", // ヘッダーの高さ分
        width: "100%",
        height: "56px",
        left: 0,
        right: 0,
      }}
    >
      <Alert
        severity={feedback.severity}
        onClose={clearFeedback}
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        {feedback.message}
      </Alert>
    </Snackbar>
  );
};
