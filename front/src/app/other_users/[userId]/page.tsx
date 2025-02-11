import { Header } from "@components/Header";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi";
import { OtherUsersPageWrapper } from "@UsersPage/OtherUsersPageWrapper";
import { Suspense } from "react";

export default function OtherUsersPage(){
  return(
    <Suspense fallback={<div>Loading...</div>}>
      <Header />
      <FeedbackAlert />
      <OtherUsersPageWrapper />
      <BottomNavi />
    </Suspense>
  );
}
