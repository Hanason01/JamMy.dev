import { Header } from "@components/Header";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi";
import { MyPageWrapper } from "@components/UsersPage/MyPageWrapper";
import { Suspense } from "react";

export async function generateMetadata() {
  return {
    title: "JamMy - マイページ",
    description: "JamMyのマイページでは、自分の投稿やプロフィールを管理できます。",
  };
}

export default function MyPage(){
  return(
    <Suspense fallback={<div>Loading...</div>}>
      <Header />
      <FeedbackAlert />
      <MyPageWrapper />
      <BottomNavi />
    </Suspense>
  );
}