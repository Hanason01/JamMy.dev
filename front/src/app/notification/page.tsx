import { Header } from "@components/Header";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi";
import { NotificationListWrapper } from "@Notification/NotificationListWrapper";
import { Suspense } from"react";

export async function generateMetadata() {
  return {
    title: "JamMy - 通知ページ",
    description: "JamMyの通知ページでは、自分の投稿に対するフィードバックや応募の通知を確認する事ができます。",
  };
}

export default function Notification(){
  return(
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <Header />
        <FeedbackAlert />
        <NotificationListWrapper />
        <BottomNavi />
      </div>
    </Suspense>
  );
}