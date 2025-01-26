import { Header } from "@components/Header"
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi"
import { ProjectWrapper } from "@Project/ProjectWrapper";
import { Suspense } from"react";

export default function ProjectIndex(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <FeedbackAlert />
      <ProjectWrapper mode={"list"} />
      < BottomNavi />
    </Suspense>
  );
}