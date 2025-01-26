import { GoogleCallback } from '@User/GoogleCallback';
import { Suspense } from'react';

export default function GoogleCallbackPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleCallback />
    </Suspense>
  );
}