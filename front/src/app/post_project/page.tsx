import { Header } from "@components/Header"
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi"
import { PostProjectStepper } from "@Project/post_project/PostProjectStepper";
import { Suspense } from"react";

export default function PostProject(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <FeedbackAlert />
      <PostProjectStepper />
      < BottomNavi />
    </Suspense>
  );
}