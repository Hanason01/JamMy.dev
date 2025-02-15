// プロジェクト一覧 (マイページ)
export const getMyProjectsKey = (index: number, filter: string) =>
  `/api/users/me?filter=${filter}&page=${index + 1}`;

// コメント一覧
export const getCommentsKey = (projectId: string) => (index: number) =>
  `/api/projects/${projectId}/comments?page=${index + 1}`;

// 通知一覧
export const getNotificationsKey = () => "/api/notifications";

// 他のユーザーのプロジェクト一覧
export const getOtherUserProjectsKey = (index: number, userId: string, filter: string) =>
  `/api/users/${userId}/other_users?filter=${filter}&page=${index + 1}`;

// プロジェクト詳細
export const getProjectDetailKey = (projectId: string) =>
  projectId ? `/api/projects/${projectId}` : null;

// 全体のプロジェクト一覧
export const getAllProjectsKey = (index: number) =>
  `/api/projects?page=${index + 1}`;
