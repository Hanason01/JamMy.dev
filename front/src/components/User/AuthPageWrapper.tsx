"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthModal } from '@User/AuthModal';

export function AuthPageWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectTo, setRedirectTo] = useState<string>("");
  const [openAuthModal, setOpenAuthModal] = useState<boolean>(true);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      const storedRedirectTo =
        searchParams.get("redirectTo") ||
        sessionStorage.getItem("redirectTo");
      setRedirectTo(storedRedirectTo|| "");
    }
  }, []);

  const handleClose = (): void => {
    setOpenAuthModal(false);
    sessionStorage.removeItem("redirectTo");
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