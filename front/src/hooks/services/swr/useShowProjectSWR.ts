"use client";
import useSWR from "swr";
import { EnrichedProject, InitialProjectData, Meta } from "@sharedTypes/types";
import { applyIsOwnerToProjects } from "@utils/applyIsOwnerToProjects";

interface PageData {
  projects: EnrichedProject[];
  meta?: Meta;
}

const fetcher = async (url: string): Promise<PageData> => {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("データの取得に失敗しました");
  const data:InitialProjectData[] = await response.json();
  const enrichedProjects = applyIsOwnerToProjects(data);

  return {
    projects: enrichedProjects,
    meta: { total_pages: 1 }, // ダミーの `meta` を追加（一覧ページと統一）
  };
};

export function useShowProject(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR<PageData>(
    projectId ? `/api/projects/${projectId}` : null,
    fetcher,
    {
      suspense: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: false,
      fallbackData: {
        projects: [],
        meta: { total_pages: 1 },
      },
    }
  );

  return {
    projects: data?.projects ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
