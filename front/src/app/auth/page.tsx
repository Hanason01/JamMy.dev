import { AuthPageWrapper } from '@User/AuthPageWrapper';
import { Suspense } from'react';

export default function AuthPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageWrapper />
    </Suspense>
  );
}