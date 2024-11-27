'use client';

import { useState } from "react";
import { usePathname } from 'next/navigation';
import { ProjectWrapper } from './Project/ProjectWrapper';
import { CollaborationForm } from './Collaboration/CollaborationForm';

export function ProjectRouterState() {
  const pathname = usePathname();
  const [currentProject, setCurrentProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const renderContent = () => {
    if (pathname === '/project') {
      return <ProjectWrapper setCurrentProject={setCurrentProject} setCurrentUser={setCurrentUser} />; // 投稿一覧
    } else if (pathname === '/project/collaborationForm') {
      return <CollaborationForm currentProject={currentProject} currentUser={currentUser} />; // 応募ページ
    } else {
      return <p>ページが見つかりません。</p>;
    }
  };

  return renderContent();
}
