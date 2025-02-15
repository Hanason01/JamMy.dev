import { EnrichedProject, InitialProjectData, InitialProjectResponse, Meta, PageData, Notification, EnrichedCommentCollection, EnrichedComment } from "@sharedTypes/types";
import { applyIsOwnerToProjects } from "@utils/applyIsOwnerToProjects";
import { applyIsOwnerToComments } from "@utils/applyIsOwnerToComments";


// 一覧ページ用 fetcher（無限スクロール向け）
// 追加フェッチのリクエスト雛形（レスポンスはすべて下記事前処理関数のフィルターを通す）
export const fetchProjectList = async (url: string): Promise<{ projects: EnrichedProject[], meta: Meta }> => {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("データ取得に失敗しました");
  const data: InitialProjectResponse = await response.json();

  return {
    projects: applyIsOwnerToProjects(data.projects),
    meta: data.meta,
  };
};


// 詳細ページ用 fetcher（単一プロジェクト向け）
export const fetchProjectDetail = async (url: string): Promise<PageData> => {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("データ取得に失敗しました");
  const data: InitialProjectData[] = await response.json();
  const enrichedProjects = applyIsOwnerToProjects(data);

  return {
    projects: enrichedProjects,
    meta: { total_pages: 1 }, // ダミーの `meta` を追加（一覧ページと統一）
  };
};


//通知用
export const fetchNotifications = async (url: string): Promise<Notification[]> => {
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    throw new Error("通知データの取得に失敗しました");
  }

  return await response.json();
};


//コメント一覧用
export const fetchProjectComments = async (url: string): Promise<{ comments: EnrichedComment[], meta: Meta }> => {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("コメントの取得に失敗しました");

  const data: EnrichedCommentCollection = await response.json();
  return {
    comments: applyIsOwnerToComments(data.comments),
    meta: data.meta,
  };
};