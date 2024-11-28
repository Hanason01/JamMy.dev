import { Header } from '../../components/Header'
import { BottomNavi } from '../../components/BottomNavi'
import { ProjectWrapper } from '../../components/Project/ProjectWrapper';
import { Suspense } from'react';

export default function ProjectIndex(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <ProjectWrapper />
      < BottomNavi />
    </Suspense>
  );
}