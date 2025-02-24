import { ResetPassword } from "@User/ResetPassword";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { Suspense } from "react";

export async function generateMetadata() {
  return {
    title: "JamMy - パスワードリセットフォーム",
  };
}

export default function ResetPasswordPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackAlert />
      <ResetPassword />
    </Suspense>
  );
}