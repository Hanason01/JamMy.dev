import { Header } from "@components/Header";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi";
import { MyPageWrapper } from "@UsersPage/UsersPageWrapper";
import { Suspense } from "react";

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