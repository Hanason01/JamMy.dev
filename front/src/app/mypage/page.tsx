import { Header } from "@components/Header";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi";
import { Suspense } from "react";

export default function MyPage(){
  return(
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <Header />
        <FeedbackAlert />
        <h1>マイページ画面</h1>
        <h3>本リリースまでお待ちください...</h3>
        <BottomNavi />
      </div>
    </Suspense>
  );
}