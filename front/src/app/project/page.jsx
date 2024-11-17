import { Header } from '../../components/Header'
import { BottomNavi } from '../../components/BottomNavi'
import { ProjectWrapper } from '../../components/Project/ProjectWrapper';


export default function ProjectIndex(){
  return(
    <>
      < Header />
      <ProjectWrapper />  {/*ProjectCard、AudioControllerおよびその表示に関わる状態管理を含む */}
      < BottomNavi />
    </>
  );
}