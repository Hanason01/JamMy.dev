import { Header } from '@components/Header'
import { BottomNavi } from '@components/BottomNavi'
import { CollaborationManagementStepper } from '@CollaborationManagement/CollaborationManagementStepper';
import { CollaborationManagementProvider } from "@context/useCollaborationManagementContext";
import { Suspense } from'react';

export default function CollaborationManagement(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
        <CollaborationManagementProvider>
          <CollaborationManagementStepper />
        </CollaborationManagementProvider>
      < BottomNavi />
    </Suspense>
  );
}