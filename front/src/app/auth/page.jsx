"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthModal } from '../../components/User/AuthModal';
import { Suspense } from'react';

export default function StaticAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") //直前のリクエストURL
  const [openAuthModal, setOpenAuthModal] = useState(true);

  const handleClose = () => {
    setOpenAuthModal(false);
    router.push('/');
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {openAuthModal ? (
        <AuthModal
          open={openAuthModal}
          handleClose={handleClose}
          redirectTo={redirectTo}
        />
      ) : null}
    </Suspense>
  );
}
