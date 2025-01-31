import { Header } from "@components/Header"
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi"
import { ProjectWrapper } from "@Project/ProjectWrapper";
import { getProjects } from "@actions/projects/getProjects";
import { Suspense } from"react";

export default async function ProjectIndex(){
  const { projects, meta } = await getProjects(1);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <FeedbackAlert />
      <ProjectWrapper mode={"list"} initialProjectData={projects} meta={meta} />
      < BottomNavi />
    </Suspense>
  );
}