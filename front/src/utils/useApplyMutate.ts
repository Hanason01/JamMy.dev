import { useSWRConfig } from "swr";
import { EnrichedProject } from "@sharedTypes/types";

interface ApplyMutateProps {
  updatedProject: EnrichedProject;
  mutateKey: string; //対象のリソースがどのページネーションページに存在するかを保持
  projectIndex: number; //対象のリソースがprojects内のどの位置にあるかを保持
  projectId: string;
  createApiRequest?:((projectId: string) => Promise<any>) //新規処理専用
  destroyApiRequest?: ((projectId: string, relatedId: string) => Promise<any>); //削除処理専用
  finalizeData?: (response: any, project: EnrichedProject) => EnrichedProject; //リクエスト完了時の適用処理
  relatedId?: string; //削除リクエストに使用
}

interface PageData {
  projects: EnrichedProject[];
  meta: { total_pages: number; [key: string]: any };
}

export const useApplyMutate = () => {
  const { mutate, cache } = useSWRConfig();

  const applyMutate = async ({
    updatedProject,
    mutateKey,
    projectIndex,
    projectId,
    createApiRequest, //オプション
    destroyApiRequest, //オプション
    finalizeData, //オプション
    relatedId, //オプション
  }: ApplyMutateProps) => {
    try{
      // マスターキー
      const masterKey = "$inf$/api/projects?page=1"; //他のfetcherにも対応できるよう将来的に動的にすべき
      // mutate(1.対象キー, 2. Updater関数, 3. オプション)
      await mutate(
        mutateKey,
        async (currentData: PageData | undefined): Promise<PageData> => {
          // ==========================
          // 2. Updater関数: キャッシュ更新処理
          // ==========================
          if (!currentData) throw new Error("現在のデータが存在しません")

          // サーバーリクエスト
          let response;

          console.log("リクエスト前", destroyApiRequest, createApiRequest, relatedId);

          if (destroyApiRequest && relatedId) {
            // destroy関連のAPIリクエスト（relatedIdが必須）
            response = await destroyApiRequest(projectId, relatedId);
          } else if (createApiRequest) {
            // create関連のAPIリクエスト（relatedIdが不要）
            response = await createApiRequest(projectId);
          }else {
            throw new Error("APIリクエスト関数が指定されていません");
          }

          // レスポンスを元に更新されたプロジェクトデータを生成（finalize処理が必要なものは関数実行）
          const finalizedProject = finalizeData
            ? finalizeData(response, updatedProject)
            : updatedProject;

          // 更新処理
          const updatedProjects = [...currentData.projects];
          updatedProjects[projectIndex] = finalizedProject;

          return { ...currentData, projects: updatedProjects };
        },
        {
          // ==========================
          // 3. オプション: (リクエスト終了前の)楽覴的更新処理
          // ==========================
          optimisticData: (prevData: PageData | undefined): PageData=> {
            if (!prevData) throw new Error("楽観的更新用のデータが存在しません");

            const optimisticProjects = [...prevData.projects];
            optimisticProjects[projectIndex] = updatedProject;

            return { ...prevData, projects: optimisticProjects };
          },
          populateCache: true, // キャッシュ保存(デフォルトはtrue)
          rollbackOnError: true, // リクエストエラー時の自動ロールバック
          revalidate: false, // 更新後の再フェッチを防ぐ
        }
      );
      // マスターキーにmutateを使いUIの再レンダリングをトリガー
      await mutate(masterKey);
    } catch (error) {
      console.error("キャッシュ更新中にエラーが発生しました:", error);
    }
  };
  return applyMutate;
};
