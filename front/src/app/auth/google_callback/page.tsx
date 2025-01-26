import { GoogleCallback } from "@User/GoogleCallback";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { Suspense } from "react";

export default function GoogleCallbackPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackAlert />
      <GoogleCallback />
    </Suspense>
  );
}