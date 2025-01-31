import { Header } from "@components/Header"
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi"
import { ProjectWrapper } from "@Project/ProjectWrapper";
import { fetchProject } from "@actions/projects/fetchProject";
import { Suspense } from"react";

export default async function ProjectShow({ params }: { params: { projectId: string } }){
  const initialProjectData = await fetchProject(params.projectId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <FeedbackAlert />
      <ProjectWrapper mode={"detail"} initialProjectData={initialProjectData} />
      < BottomNavi />
    </Suspense>
  );
}
