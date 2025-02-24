import { AuthPending } from "@User/AuthPending";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { Suspense } from "react";

export async function generateMetadata() {
  return {
    title: "JamMy - メール認証ページ",
  };
}

export default function PendingPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackAlert />
      <AuthPending />
    </Suspense>
  );
}