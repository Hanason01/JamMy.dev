import { Header } from '@components/Header'
import { BottomNavi } from '@components/BottomNavi'
import { CollaborationStepper } from '@Collaboration/CollaborationStepper';
import { Suspense } from'react';

export default function Collaboration(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <CollaborationStepper />
      < BottomNavi />
    </Suspense>
  );
}
