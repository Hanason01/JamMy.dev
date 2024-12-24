"use client";

import { User, Project} from "@sharedTypes/types";
import { useState, useEffect } from 'react';
import { useProjectContext } from "@context/useProjectContext";

export function CollaborationForm() {
  const { currentProject, currentUser } = useProjectContext();
  const [storedProject, setStoredProject] = useState<Project | null>(null);
  const [storedUser, setStoredUser] = useState<User | null>(null);

  //以下ブラウザ依存コードにつきuseEffectで管理
  useEffect(() => {
  // セッションストレージにデータを保存(リロード対策)
  if (currentProject && currentUser) {
      sessionStorage.setItem('currentProject', JSON.stringify(currentProject));
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  // セッションストレージからデータを取得
  const projectFromStorage = sessionStorage.getItem('currentProject');
  const userFromStorage = sessionStorage.getItem('currentUser');
  const project = projectFromStorage ? JSON.parse(projectFromStorage) as Project : null;
  const user = userFromStorage ? JSON.parse(userFromStorage) as User : null;
  setStoredProject(project);
  setStoredUser(user);
  }, []);

  //状態変数またはセッションよりデータを取得
  const project = currentProject || storedProject;
  const user = currentUser || storedUser;

  if (!project || !user) {
    return <p>プロジェクト情報が見つかりません。</p>;
  }

  return (
    <div>
      <h1>{project.attributes.title} への応募フォーム</h1>
      <p>投稿者: {user.attributes.username}</p>
    </div>
  );
}
