import { Header } from "@components/Header";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi";
import { UsersPageWrapper } from "@components/UsersPage/UsersPageWrapper";
import { Suspense } from "react";

export default function OtherUsersPage(){
  return(
    <Suspense fallback={<div>Loading...</div>}>
      <Header />
      <FeedbackAlert />
      <UsersPageWrapper />
      <BottomNavi />
    </Suspense>
  );
}
