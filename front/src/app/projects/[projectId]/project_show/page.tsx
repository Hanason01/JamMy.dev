import { Header } from "@components/Header"
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi"
import { ProjectShowWrapper } from "@components/Project/ProjectShowWrapper";
import { Suspense } from"react";

export default async function ProjectShow(){

  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <FeedbackAlert />
      <ProjectShowWrapper/>
      < BottomNavi />
    </Suspense>
  );}
