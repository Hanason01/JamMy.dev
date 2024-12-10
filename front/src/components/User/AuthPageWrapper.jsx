"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthModal } from './AuthModal';

export function AuthPageWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || sessionStorage.getItem("redirectTo") || "/" //直前のリクエストURL
  const [openAuthModal, setOpenAuthModal] = useState(true);

  const handleClose = () => {
    setOpenAuthModal(false);
    router.push('/');
  };

  return (
      openAuthModal ? (
        <AuthModal
          open={openAuthModal}
          handleClose={handleClose}
          redirectTo={redirectTo}
        />
      ) : null
  );
}