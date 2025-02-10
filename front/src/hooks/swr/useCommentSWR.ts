"use client"
import useSWRInfinite from "swr/infinite";
import { EnrichedCommentCollection, EnrichedComment, Meta } from "@sharedTypes/types";
import { applyIsOwnerToComments } from "@utils/applyIsOwnerToComments";

// コメントフェッチ用のfetcher関数
const fetcher = async (url: string): Promise<{ comments: EnrichedComment[], meta: Meta }> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("コメントの取得に失敗しました");

  const data: EnrichedCommentCollection = await res.json();
  return {
    comments: applyIsOwnerToComments(data.comments),
    meta: data.meta,
  };
};

// コメント用のSWRフック（無限スクロール対応）
export function useProjectComments(projectId: string) {
  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    (index) => `/api/projects/${projectId}/comments?page=${index + 1}`,
    fetcher,
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
  };
}

// 出力例:
// data = [
//   { comments: [...page1のコメント], meta: { total_pages: 3 } },
//   { comments: [...page2のコメント], meta: { total_pages: 3 } },
//   { comments: [...page3のコメント], meta: { total_pages: 3 } },
// ];

// comments = [...page1のコメント, ...page2のコメント, ...page3のコメント];
