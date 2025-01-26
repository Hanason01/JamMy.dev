import { AuthPageWrapper } from "@User/AuthPageWrapper";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { Suspense } from"react";

export default function AuthPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackAlert />
      <AuthPageWrapper />
    </Suspense>
  );
}