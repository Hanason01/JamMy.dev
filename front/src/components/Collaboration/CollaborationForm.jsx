import { useEffect } from 'react';

export function CollaborationForm({ currentProject, currentUser }) {
  // セッションストレージにデータを保存(リロード対策)
  useEffect(() => {
    if (currentProject && currentUser) {
      sessionStorage.setItem('currentProject', JSON.stringify(currentProject));
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, []);

  // セッションストレージからデータを取得
  const storedProject = JSON.parse(sessionStorage.getItem('currentProject'));
  const storedUser = JSON.parse(sessionStorage.getItem('currentUser'));

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
