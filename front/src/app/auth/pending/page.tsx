import { AuthPending } from "@User/AuthPending";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { Suspense } from "react";

export default function PendingPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackAlert />
      <AuthPending />
    </Suspense>
  );
}