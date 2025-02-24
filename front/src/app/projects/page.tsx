import { Header } from "@components/Header"
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi"
import { ProjectIndexWrapper } from "@components/Project/ProjectIndexWrapper";
import { Suspense } from"react";

export async function generateMetadata() {
  return {
    title: "JamMy - 投稿一覧ページ",
    description: "JamMyの投稿一覧ページでは、さまざまなユーザーが作成したサウンドを閲覧できます。",
  };
}

export default function ProjectIndex(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <FeedbackAlert />
      <ProjectIndexWrapper />
      < BottomNavi />
    </Suspense>
  );
}