import { AuthPageWrapper } from "@User/AuthPageWrapper";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { Suspense } from"react";

export async function generateMetadata() {
  return {
    title: "JamMy - 認証ページ",
  };
}

export default function AuthPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackAlert />
      <AuthPageWrapper />
    </Suspense>
  );
}