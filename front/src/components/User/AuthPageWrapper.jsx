"use client";
// export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthModal } from './AuthModal';
// import { Suspense } from'react';

export function AuthPageWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") //直前のリクエストURL
  const [openAuthModal, setOpenAuthModal] = useState(true);

  const handleClose = () => {
    setOpenAuthModal(false);
    router.push('/');
  };

  return (
    // <Suspense fallback={<div>Loading...</div>}>
      openAuthModal ? (
        <AuthModal
          open={openAuthModal}
          handleClose={handleClose}
          redirectTo={redirectTo}
        />
      ) : null
    // </Suspense>
  );
}