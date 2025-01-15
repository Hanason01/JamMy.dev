import { Header } from '@components/Header'
import { BottomNavi } from '@components/BottomNavi'
import { CollaborationManagementStepper } from '@CollaborationManagement/CollaborationManagementStepper';
import { Suspense } from'react';

export default function CollaborationManagement(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <CollaborationManagementStepper />
      < BottomNavi />
    </Suspense>
  );
}