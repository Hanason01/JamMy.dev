import { Header } from "@components/Header"
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi"
import { CollaborationStepper } from "@Collaboration/CollaborationStepper";
import { Suspense } from"react";

export async function generateMetadata() {
  return {
    title: "JamMy - 音声応募ページ",
    description: "JamMyの音声応募ページでは、音声を録音・編集して他人の投稿にコラボの応募をする事ができます。",
  };
}

export default function Collaboration(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <FeedbackAlert />
      <CollaborationStepper />
      < BottomNavi />
    </Suspense>
  );
}
