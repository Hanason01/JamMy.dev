import { AuthPending } from '@User/AuthPending';
import { Suspense } from'react';

export default function PendingPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPending />
    </Suspense>
  );
}