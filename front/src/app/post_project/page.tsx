import { Header } from '@components/Header'
import { BottomNavi } from '@components/BottomNavi'
import { PostProjectStepper } from '@Project/post_project/PostProjectStepper';
import { Suspense } from'react';

export default function PostProject(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <PostProjectStepper />
      < BottomNavi />
    </Suspense>
  );
}