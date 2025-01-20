import { Header } from '@components/Header'
import { BottomNavi } from '@components/BottomNavi'
import { ProjectWrapper } from '@Project/ProjectWrapper';
import { Suspense } from'react';

export default function Collaboration(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <ProjectWrapper mode={"detail"} />
      < BottomNavi />
    </Suspense>
  );
}
