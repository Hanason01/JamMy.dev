import { Header } from "@components/Header";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi";
import { NotificationListWrapper } from "@Notification/NotificationListWrapper";
import { Suspense } from"react";

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