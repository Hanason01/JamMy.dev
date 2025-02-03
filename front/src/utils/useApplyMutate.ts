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
      const masterKey = Array.from((cache as Map<string, any>).keys()).find(key =>
        key.startsWith('$inf$/api/projects')
      );
      console.log("master key: " + masterKey);
      // mutate(1.対象キー, 2. Updater関数, 3. オプション)
      await mutate(
        masterKey,
        async (currentData: PageData[] | undefined): Promise<PageData[]> => {
          // ==========================
          // 2. Updater関数: キャッシュ更新処理
          // ==========================
          if (!currentData) return [];

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
            console.error("APIリクエスト関数が指定されていません");
            return currentData; // 既存のキャッシュをそのまま返す
          }

          // レスポンスを元に更新されたプロジェクトデータを生成（finalize処理が必要なものは関数実行）
          const finalizedProject = finalizeData
            ? finalizeData(response, updatedProject)
            : updatedProject;

          // 更新処理
          const updatedData = currentData.map((pageData, index) => {
            const pageIndexFromKey = parseInt(mutateKey.split('=')[1], 10); // mutateKey からページ番号を抽出

            if (index + 1 === pageIndexFromKey) { //対象のprojectを特定
              const updatedProjects = [...pageData.projects];
              updatedProjects[projectIndex] = finalizedProject;
              return { ...pageData, projects: updatedProjects };
            }
            return pageData;
          });
        return updatedData;

        },
        {
          // ==========================
          // 3. オプション: (リクエスト終了前の)楽覴的更新処理
          // ==========================
          optimisticData: (prevData: PageData[] | undefined): PageData[]=> {
            if (!prevData) return [];

            return prevData.map((pageData, index) => {
              const pageIndexFromKey = parseInt(mutateKey.split('=')[1], 10);

              if (index + 1 === pageIndexFromKey) {
                const optimisticProjects = [...pageData.projects];
                optimisticProjects[projectIndex] = updatedProject;
                return { ...pageData, projects: optimisticProjects };
              }

              return pageData;
            });
          },
          populateCache: true, // キャッシュ保存(デフォルトはtrue)
          rollbackOnError: true, // リクエストエラー時の自動ロールバック
          revalidate: false, // 更新後の再フェッチを防ぐ
        }
      );

    } catch (error) {
      console.error("キャッシュ更新中にエラーが発生しました:", error);
    }
  };
  return applyMutate;
};
