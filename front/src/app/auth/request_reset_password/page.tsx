import { RequestResetPassword } from "@User/RequestResetPassword";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { Suspense } from "react";

export async function generateMetadata() {
  return {
    title: "JamMy - パスワードリセットページ",
  };
}

export default function RequestResetPasswordPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackAlert />
      <RequestResetPassword />
    </Suspense>
  );
}