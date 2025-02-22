"use client";
import { useEffect } from "react";
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
      revalidateOnMount: false,
    }
  );

  useEffect(() => {
    if (!data) {
      mutate();
    }
  }, []);

  return {
    projects: data?.projects,
    isLoading,
    isError: !!error,
    isValidating,
    mutate,
    getKey,
  };
}

//補足
//useSWRはSWRInfinityと違い、revalidateOnMount: trueの設定に従順で必ずマウント時に再フェッチをかける仕様になっている。この設定は初回データ取得時には必要なものであるが、すでにキャッシュがあるのであれば、マウントの度に再フェッチをするのは非効率でありリクエスト回数が無駄に増え、パフォーマンスを悪化させる。そこで、上記のようにカスタムし、グローバルからcacheを取得しその中にすでにこのSWR由来のキーのものが存在する場合は、動的にこの設定をfalseにする事で、初回および必要な時だけ再フェッチをさせる方式に変えている。