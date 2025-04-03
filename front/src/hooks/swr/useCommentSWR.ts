"use client"
import useSWRInfinite from "swr/infinite";
import { fetchProjectComments } from "@swr/fetcher";
import { getCommentsKey } from "@swr/getKeys";

export function useProjectComments(projectId: string) {
  const getKey = getCommentsKey(projectId);

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    fetchProjectComments,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateFirstPage: false,
      revalidateOnMount: true,
    }
  );

  return {
    comments: data ? data.map(page => page.comments).flat() : [],
    meta: data?.[0]?.meta,
    hasMore: data && data.length > 0 ? data[data.length - 1].meta.total_pages > size : false,
    loadMore: () => setSize(size + 1),
    isLoading: !data && !error,
    isError: !!error,
    isValidating,
    mutate,
    getKey
  };
}
