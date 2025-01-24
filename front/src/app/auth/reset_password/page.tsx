import { ResetPassword } from '@User/ResetPassword';
import { Suspense } from'react';

export default function ResetPasswordPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}