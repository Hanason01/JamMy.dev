"use client"
import useSWRInfinite from "swr/infinite";
import { EnrichedProject } from "@sharedTypes/types";
import { fetchProjectList } from "@swr/fetcher";
import { getOtherUserProjectsKey  } from "@swr/getKeys";
import { useSWRContext } from "@context/useSWRContext";



export function useOtherUserProjects(user_id: string, filter: "user_projects" | "user_collaborated") {
  const { setOtherUserProjectsMutate, otherUserProjectsMutate } = useSWRContext();
  const getKey = (index: number) => getOtherUserProjectsKey(index, user_id, filter);
  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
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

  if (!otherUserProjectsMutate || otherUserProjectsMutate !== mutate) {
    setOtherUserProjectsMutate(mutate);
  }

  return {
    projects,
    meta: data?.[0]?.meta,
    hasMore: hasMore,
    loadMore: () => setSize(size + 1),
    isLoading: !data && !error,
    isError: !!error,
    isValidating,
    mutate,
    getKey
  };
}
