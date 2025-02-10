"use client"
import useSWRInfinite from "swr/infinite";
import { EnrichedProject } from "@sharedTypes/types";
import { fetchProjectList } from "@swr/fetcher";

// 取得キーを生成
export const getMyPageKey = (index: number, filter: string) =>
  `/api/projects/my_projects?filter=${filter}&page=${index + 1}`;


export function useMyProjects(filter: "my_projects" | "collaborating" | "collaborated" | "bookmarks") {
  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    (index) => getMyPageKey(index, filter),
    fetchProjectList,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateFirstPage: false,
      revalidateOnMount: true,
    }
  );

  const projects: EnrichedProject[] = data
    ? data.flatMap((page) => page.projects)
    : [];
  const hasMore = data ? data[data.length - 1]?.meta?.total_pages > size : false;


  return {
    projects,
    meta: data?.[0]?.meta,
    hasMore: hasMore,
    loadMore: () => setSize(size + 1),
    isLoading: !data && !error,
    isError: !!error,
    isValidating,
    mutate,
  };
}
