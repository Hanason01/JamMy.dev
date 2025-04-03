"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { FeedbackState, FeedbackContextType, FeedbackSeverity, WithChildren } from "@sharedTypes/types";
import feedbackMessages from "@constants/feedbackMessages";


const initialContext: FeedbackContextType = {
  feedback: {
    open: false,
    message: "",
    severity: "info",
  },
  setFeedbackByKey: () => {
    console.warn("setFeedback is not implemented");
  },
  setFeedbackAndReload: () => {
    console.warn("setFeedbackAndReload is not implemented");
  },
  clearFeedback: () => {
    console.warn("clearFeedback is not implemented");
  },
};

const FeedbackContext = createContext<FeedbackContextType>(initialContext);

export function FeedbackProvider({ children }: WithChildren) {
  const [feedback, setFeedbackState] = useState<FeedbackState>({
    open: false,
    message: "",
    severity: "info",
  });

  // Set処理
  const setFeedbackByKey = (key: string) => {
    const keys = key.split(":");
    let feedbackData: any = feedbackMessages;

    for (const k of keys) {
      feedbackData = feedbackData?.[k as keyof typeof feedbackMessages];
      if (!feedbackData) {
        console.warn(`フィードバックキーエラー: ${key}`);
        return;
      }
    }

    if (feedbackData?.message && feedbackData?.severity) {
      setFeedbackState({
        open: true,
        message: feedbackData.message,
        severity: feedbackData.severity,
      });
    } else {
      console.warn(`フィードバックデータが不完全です: ${key}`);
    }
  };

  // フィードバックを設定してリロード
  const setFeedbackAndReload = (key: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("feedback", key);
    window.location.href = url.toString();
  };

  // Clear処理
  const clearFeedback = () => {
    setFeedbackState({ open: false, message: "", severity: "info" });
  };

  return (
    <FeedbackContext.Provider
    value={{
      feedback,
      setFeedbackByKey,
      setFeedbackAndReload,
      clearFeedback
    }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export function useFeedbackContext() {
  return useContext(FeedbackContext);
}