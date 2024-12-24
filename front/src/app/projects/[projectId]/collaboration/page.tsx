import { Header } from '../../../../components/Header'
import { BottomNavi } from '../../../../components/BottomNavi'
import { CollaborationForm } from '../../../../components/Collaboration/CollaborationForm';
import { Suspense } from'react';

export default function Collaboration(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <CollaborationForm />
      < BottomNavi />
    </Suspense>
  );
}