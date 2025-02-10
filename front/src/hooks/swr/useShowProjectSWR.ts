"use client";
import useSWR from "swr";
import { PageData } from "@sharedTypes/types";
import { fetchProjectDetail } from "@swr/fetcher";

export function useShowProject(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR<PageData>(
    projectId ? `/api/projects/${projectId}` : null,
    fetchProjectDetail,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
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
