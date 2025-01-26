import { Header } from "@components/Header";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi";
import { Suspense } from"react";

export default function Notification(){
  return(
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <Header />
        <FeedbackAlert />
        <h1>通知画面</h1>
        <h3>本リリースまでお待ちください...</h3>
        <BottomNavi />
      </div>
    </Suspense>
  );
}