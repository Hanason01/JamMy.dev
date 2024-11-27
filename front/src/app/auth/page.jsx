"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthModal } from '../../components/User/AuthModal';

export default function StaticAuthPage() {
  const router = useRouter();

  const [openAuthModal, setOpenAuthModal] = useState(true);

  const handleClose = () => {
    setOpenAuthModal(false);
    router.push('/');
  };

  return openAuthModal ?(
    <AuthModal
      open={openAuthModal}
      handleClose={handleClose}
    />
  ) : null;
}
