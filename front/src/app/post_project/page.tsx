import { Header } from "@components/Header"
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi"
import { PostProjectStepper } from "@Project/post_project/PostProjectStepper";
import { Suspense } from"react";

export async function generateMetadata() {
  return {
    title: "JamMy - 音声投稿ページ",
    description: "JamMyの音声投稿ページでは、音声を録音・編集して投稿する事ができます。",
  };
}

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