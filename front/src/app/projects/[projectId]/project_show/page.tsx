import { Header } from "@components/Header"
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi"
import { ProjectShowWrapper } from "@components/Project/ProjectShowWrapper";
import { Suspense } from"react";

export async function generateMetadata() {
  return {
    title: "JamMy - 投稿詳細ページ",
    description: "JamMyの投稿詳細ページでは、各投稿の詳細と確認したりコメントを投稿したりできます。",
  };
}

export default async function ProjectShow(){

  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <FeedbackAlert />
      <ProjectShowWrapper/>
      < BottomNavi />
    </Suspense>
  );}
