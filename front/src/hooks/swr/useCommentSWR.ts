"use client"
import useSWRInfinite from "swr/infinite";
import { fetchProjectComments } from "@swr/fetcher";
import { getCommentsKey } from "@swr/getKeys";

// コメント用のSWRフック（無限スクロール対応）
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
      compare: (a, b) => JSON.stringify(a) === JSON.stringify(b),
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

// 出力例:
// data = [
//   { comments: [...page1のコメント], meta: { total_pages: 3 } },
//   { comments: [...page2のコメント], meta: { total_pages: 3 } },
//   { comments: [...page3のコメント], meta: { total_pages: 3 } },
// ];

// comments = [...page1のコメント, ...page2のコメント, ...page3のコメント];
