"use client"
import useSWRInfinite from "swr/infinite";
import { InitialProjectResponse, InitialProjectData, EnrichedProject, Meta } from "@sharedTypes/types";
import { applyIsOwner } from "@utils/applyIsOwner";

// 追加フェッチのリクエスト雛形（レスポンスはすべて下記事前処理関数のフィルターを通す）
const fetcher = async (url: string): Promise<{ projects: EnrichedProject[], meta: Meta }> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("データ取得に失敗しました");
  const data: InitialProjectResponse = await res.json();

  return {
    projects: applyIsOwner(data.projects), // 取得後すぐ isOwner を適用
    meta: data.meta,
  };
};


// 投稿一覧 (無限スクロール用)
export function useProjectList() {
  console.log("SWR呼び出し");
  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    (index) => `/api/projects?page=${index + 1}`, //ページネーション指定(index = 0)
    fetcher,
    {
      suspense: true, // suspendモード
      fallbackData: [{ projects: [], meta: { total_pages: 0 } }],
      revalidateFirstPage: false, // 再フェッチ無効化（再マウント時にフェッチしない）
      revalidateOnMount: true, //初回フェッチ有効か（デフォルトtrue）
      compare: (a, b) => JSON.stringify(a) === JSON.stringify(b), //デフォルトはシャロウコピー、この設定でディープコピー検知を行う
    }
  );

  const projects: EnrichedProject[] = data
    ? data.flatMap((page) => page.projects as EnrichedProject[])
    : [];//全データ(以下出力例参照)
  console.log("SWR内でproject監視", projects);

  return {
    projects,
    meta: data?.[0]?.meta, //最初のページのmeta
    hasMore: data && data.length > 0 ? data[data.length - 1].meta.total_pages > size : false, //追加すべきページがあるか判定
    loadMore: () => setSize(size + 1), //次ページの読み込み
    isLoading: !data && !error, //初回ロード中かフラグ
    isError: !!error, //エラー情報
    isValidating, //追加取得中かフラグ
    mutate, // 楽観的更新用
  };
}

//データ出力例
// data = [
//   { projects: [...page1のプロジェクト], meta: { total_pages: 3 } },
//   { projects: [...page2のプロジェクト], meta: { total_pages: 3 } },
//   { projects: [...page3のプロジェクト], meta: { total_pages: 3 } },
// ];

// projects = [...page1のプロジェクト, ...page2のプロジェクト, ...page3のプロジェクト];

// メソッド等について補足
// size・・・useSWRInfinite によって現在取得済みのページ数（ setSize() を何回呼んだか)
// loadMore・・・sizeを増加、つまり取得済みのページ数を進行。setSizeはそれと同時に「(index) => `/api/projects?page=${index + 1}`」こちらをトリガーし、indexにそのsizeを充てる（つまり次ページフェッチ）
