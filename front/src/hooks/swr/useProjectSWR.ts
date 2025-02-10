"use client"
import useSWRInfinite from "swr/infinite";
import { EnrichedProject } from "@sharedTypes/types";
import { fetchProjectList } from "@swr/fetcher";

export const getIndexKey = (index: number) => `/api/projects?page=${index + 1}`;

// 投稿一覧 (無限スクロール用)
export function useProjectList() {
  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getIndexKey, //ページネーション指定(index = 0)
    fetchProjectList,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateFirstPage: false, // 再フェッチ無効化（再マウント時にフェッチしない）
      revalidateOnMount: true, //初回フェッチ有効か（デフォルトtrue）
    }
  );

  const projects: EnrichedProject[] = data
    ? data.flatMap((page) => page.projects as EnrichedProject[])
    : [];//全データ(以下出力例参照)
  // console.log("SWR内でproject監視", projects);
  const hasMore = data ? data[data.length - 1]?.meta?.total_pages > size : false;

  return {
    projects,
    meta: data?.[0]?.meta, //最初のページのmeta
    hasMore: hasMore, //追加すべきページがあるか判定
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


// ＊/重大な補足/＊
// useSWRconfigの管轄にあるSWRの初期化ファイル（layout.ts出ればすなわちアプリ全体）はそれを呼び出すコンポーネントがマウントされていなかったとしても、キーの作成は行われる。さらにrevalidateOnMount: trueであれば初回フェッチが行われ、それを全てに設定していたとすれば、結果としてアプリ全ての必要な初期データが初回で準備される事になる