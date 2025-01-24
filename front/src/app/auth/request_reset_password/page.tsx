import { RequestResetPassword } from '@User/RequestResetPassword';
import { Suspense } from'react';

export default function RequestResetPasswordPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RequestResetPassword />
    </Suspense>
  );
}