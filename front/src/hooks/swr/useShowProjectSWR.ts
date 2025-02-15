"use client";
import useSWR from "swr";
import { PageData } from "@sharedTypes/types";
import { fetchProjectDetail } from "@swr/fetcher";
import { getProjectDetailKey } from "@swr/getKeys";

export function useShowProject(projectId: string) {
  const getKey = () => getProjectDetailKey(projectId);
  const { data, error, isLoading, isValidating, mutate } = useSWR<PageData>(
    getKey,
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
    isValidating,
    mutate,
    getKey,
  };
}
