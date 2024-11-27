import { Header } from '../../components/Header'
import { BottomNavi } from '../../components/BottomNavi'
import { ProjectRouterState } from '../../components/ProjectRouterState';

export default function ProjectIndex(){
  return (
    <div>
      < Header />
      <ProjectRouterState />
      < BottomNavi />
    </div>
  );
}