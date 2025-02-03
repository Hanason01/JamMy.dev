import { Header } from "@components/Header"
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi"
import { ProjectIndexWrapper } from "@components/Project/ProjectIndexWrapper";
import { Suspense } from"react";

export default function ProjectIndex(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <FeedbackAlert />
      <ProjectIndexWrapper />
      < BottomNavi />
    </Suspense>
  );
}