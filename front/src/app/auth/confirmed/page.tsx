import { AuthConfirmed } from '@User/AuthConfirmed';
import { Suspense } from'react';

export default function ConfirmedPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthConfirmed />
    </Suspense>
  );
}