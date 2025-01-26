import { AuthConfirmed } from "@User/AuthConfirmed";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { Suspense } from"react";

export default function ConfirmedPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackAlert />
      <AuthConfirmed />
    </Suspense>
  );
}