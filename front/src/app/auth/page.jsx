"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthModal } from '../../components/User/AuthModal';

//動的レンダリングに設定
export const dynamic = "force-dynamic";

export default function StaticAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") //直前のリクエストURL
  const [openAuthModal, setOpenAuthModal] = useState(true);

  const handleClose = () => {
    setOpenAuthModal(false);
    router.push('/');
  };

  return openAuthModal ?(
    <AuthModal
      open={openAuthModal}
      handleClose={handleClose}
      redirectTo={redirectTo}
    />
  ) : null;
}
