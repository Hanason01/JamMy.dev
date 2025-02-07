import { useSWRConfig } from "swr";
import { EnrichedProject } from "@sharedTypes/types";

interface ApplyMutateProps {
  updatedProject: EnrichedProject;
  detailMutateKey?: string; //ShowページベースSWR
  listMutateKey?: string; //IndexページベースSWR
  projectIndex?: number; //対象のリソースがprojects内のどの位置にあるかを保持（詳細ページは0）
  projectId: string;
  createApiRequest?:((projectId: string) => Promise<any>) //新規処理専用
  destroyApiRequest?: ((projectId: string, relatedId: string) => Promise<any>); //削除処理専用
  finalizeData?: (response: any, project: EnrichedProject) => EnrichedProject; //リクエスト完了時の適用処理
  relatedId?: string; //削除リクエストに使用
  isShowMode: boolean;
}

interface PageData {
  projects: EnrichedProject[];
  meta?: { total_pages: number; [key: string]: any }; //Showの場合はなし
}

export const useApplyMutate = () => {
  const { mutate, cache } = useSWRConfig();

  const applyMutate = async ({
    updatedProject,
    detailMutateKey, //オプション
    listMutateKey, //オプション
    projectIndex, //オプション
    projectId,
    createApiRequest, //オプション
    destroyApiRequest, //オプション
    finalizeData, //オプション
    relatedId, //オプション
    isShowMode,
  }: ApplyMutateProps) => {

    console.log("=== applyMutate 呼び出し ===");
    console.log("updatedProject:", updatedProject);
    console.log("detailMutateKey:", detailMutateKey);
    console.log("listMutateKey:", listMutateKey);
    console.log("projectIndex:", projectIndex);
    console.log("projectId:", projectId);
    console.log("createApiRequest:", createApiRequest ? "関数がセットされています" : "未定義");
    console.log("destroyApiRequest:", destroyApiRequest ? "関数がセットされています" : "未定義");
    console.log("finalizeData:", finalizeData ? "関数がセットされています" : "未定義");
    console.log("relatedId:", relatedId);
    console.log("isShowMode:", isShowMode);
    console.log("===========================");

    try{
      // どちらのページも開かれていない場合は異常であり処理を離脱
      if (!detailMutateKey && !listMutateKey) {
        console.warn("一覧ページ、詳細ページのどちらのキャッシュも存在しないため、更新処理をスキップしました。");
        return;
      }

      //Mutate処理
      const updateCache = async (mutateKey: string | undefined, projectIndex: number | undefined ) => {
        console.log("updateCache発動", mutateKey,projectIndex);
        console.log("一覧ページのキャッシュ更新前", cache.get(indexMasterKey));
        if (!mutateKey || projectIndex === undefined) return;
        await mutate( //キャッシュ更新処理
          mutateKey,
          async (currentData: PageData | undefined): Promise<PageData> => {
            // mutate(1.対象キー, 2. Updater関数, 3. オプション)
            console.log("mutate関数発動", mutateKey,currentData);

            if (!currentData) throw new Error("現在のデータが存在しません")

            // サーバーリクエスト（create/delete双方に対応）
            let response;
            if (destroyApiRequest && relatedId) {
              console.log("削除リクエスト開始", destroyApiRequest, relatedId);
              // destroy関連のAPIリクエスト（relatedIdが必須）
              response = await destroyApiRequest(projectId, relatedId);
            } else if (createApiRequest) {
              console.log("新規リクエスト開始", createApiRequest);
              // create関連のAPIリクエスト（relatedIdが不要）
              response = await createApiRequest(projectId);
            }else {
              throw new Error("APIリクエスト関数が指定されていません");
            }

            // レスポンスを元に更新されたプロジェクトデータを生成（finalize処理が必要なものは関数実行）
            console.log("終了データを保持", response, finalizeData);
            const finalizedProject = finalizeData
              ? finalizeData(response, updatedProject)
              : updatedProject;

            // 一覧ページのキャッシュも更新
            if(isShowMode && listMutateKey){
              console.log("詳細更新後、一覧も更新");
              await mutate(
                indexMasterKey,
                (prevData: PageData[] | undefined) => {
                  if (!prevData) return prevData;
                  return prevData.map((page) => ({
                    ...page,
                    projects: page.projects.map((p) => (p.id === finalizedProject.id ? finalizedProject : p)),
                  }));
                },
                { revalidate: false } // ここでリクエストを発生させない
              );
            } else if( !isShowMode && detailMutateKey){
              await mutate(
                detailMutateKey,
                (prevData: PageData | undefined) => {
                if (!prevData) return prevData;
                return {
                  ...prevData,
                  projects: prevData.projects.map((p) => (p.id === finalizedProject.id ? finalizedProject : p)),
                };
              }, { revalidate: false });
            };

            return { ...currentData, projects: [finalizedProject] };
          },
          {
            optimisticData: (prevData: PageData | undefined): PageData=> { //楽観的更新
              if (!prevData) throw new Error("楽観的更新用のデータが存在しません");
              console.log("楽観的更新発動",prevData)

              const optimisticProjects = [...prevData.projects];
              optimisticProjects[projectIndex] = updatedProject;
              console.log("更新後データ", optimisticProjects)

              return { ...prevData, projects: optimisticProjects };
            },
            // populateCache: false, // キャッシュ保存(デフォルトはtrue)
            rollbackOnError: true, // リクエストエラー時の自動ロールバック
            revalidate: false, // 更新後の再フェッチを防ぐ
          }
        );
      }

      // マスターキー定義（SWRInfinityを使用しないShow側はshowMutateKeyがマスターキーとなる）
      const indexMasterKey = "$inf$/api/projects?page=1";

      //Showページ処理の場合
      if (isShowMode) {
        console.log("Show時の処理開始")
        if (detailMutateKey) {
          console.log("詳細処理");
          await updateCache(detailMutateKey, 0); //Showの楽観的更新
          console.log("一覧ページのキャッシュ更新後", cache.get(indexMasterKey));
        }
        if (listMutateKey) {
          console.log("一覧処理");
          await mutate(indexMasterKey);
        }
      //Indexページ処理の場合
      } else {
        console.log("Index時の処理開始")
        if (listMutateKey) {
          console.log("一覧処理");
          await updateCache(listMutateKey, projectIndex); //Indexの楽観的更新
          await mutate(indexMasterKey);
        }
      }

      } catch (error) {
        console.error("キャッシュ更新中にエラーが発生しました:", error);
      }
    };
  return applyMutate;
};