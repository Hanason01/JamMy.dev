import { AuthConfirmed } from "@User/AuthConfirmed";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { Suspense } from"react";

export async function generateMetadata() {
  return {
    title: "JamMy - メール認証ページ",
  };
}

export default function ConfirmedPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackAlert />
      <AuthConfirmed />
    </Suspense>
  );
}