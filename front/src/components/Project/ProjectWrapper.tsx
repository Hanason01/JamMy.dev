"use client";
import { Project, User, EnrichedProject, AudioFile, IncludedItem } from "@sharedTypes/types";
import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import throttle from "lodash/throttle";
import { useParams } from "next/navigation";
import { Box, Alert, CircularProgress, Typography } from "@mui/material";
import { ProjectCard } from "@Project/ProjectCard";
import { AudioController } from "@components/Project/AudioController";
import { useProjectIndexRequest } from "@services/project/useProjectIndexRequest";
import { useProjectShowRequest } from "@services/project/useProjectShowRequest";
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { useClientCacheContext } from "@context/useClientCacheContext";
import { useProjectContext } from "@context/useProjectContext";


export function ProjectWrapper({
  mode,
}:{
  mode: "list" | "detail";
}){
  const [isAudioControllerVisible, setAudioControllerVisible] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<ArrayBuffer | null>(null);
  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  console.log("ProjectWrapperのprojects", projects);

  //無限スクロール
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);


  //オーディオコントローラーに使用
  const [projectForController, setProjectForController] = useState<Project | null>(null);
  const [userForController, setUserForController] = useState<User | null>(null);


  //フック
  const { fetchAudioData } = useFetchAudioData();
  const { projectIndexRequest } = useProjectIndexRequest();
  const { projectShowRequest } = useProjectShowRequest();

  //Context
  const {
    cachedProject, setCachedProject,
    cachedPage, setCachedPage,
    cachedHasMore, setCachedHasMore,
    scrollPosition,
  } = useClientCacheContext();

  const { currentProjectForShow } = useProjectContext();

  //useParams
  const params = useParams();

  //リクエスト初期化
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // Showモードの場合
    if (mode === "detail") {
      //投稿一覧からの遷移の場合
      if(currentProjectForShow){
        setProjects([currentProjectForShow]);
      } else{
        const fetchData = async () => {
          try {
            if (!signal?.aborted) {
              const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
              if (!projectId) {
                throw new Error("ProjectIdが指定されていません");
              }
              const { data, included} = await projectShowRequest(projectId);
              const enrichedProjects = enrichedProject(data, included);
              setProjects(enrichedProjects);
              }
            } catch (error) {
              console.error("Projectデータ取得時にエラーが発生しました:", error);
            }
        };
        fetchData();
      }
      setLoading(false);
    } else {
      if(cachedProject.length > 0) {
        setProjects(cachedProject);
        setPage(cachedPage);
        setHasMore(cachedHasMore);

        // スクロール位置を復元
        setTimeout(() => {
          window.scrollTo(0, scrollPosition.current);
        }, 0); // DOM描画完了後

        setLoading(false);
      }else{
        loadProjects(1, { signal });
        setLoading(false);
      }
    }

    return () => {
      controller.abort(); // 非同期処理を中断
      setProjects([]);
    }
  }, []);

  //プロジェクトデータロード
  const loadProjects = async (page: number, options?: { signal?: AbortSignal }) => {
    console.log("loadProjectsが呼び出し");

    const signal = options?.signal;

    try {
      const { data, included, meta } = await projectIndexRequest(page);

      // アボートされた場合は処理を終了
      if (signal?.aborted) {
        console.log("loadProjectsが中断されました");
        return;
      }

      //ページネーションの終了判定
      if(page >= meta.total_pages){
        setHasMore(false);
        setCachedHasMore(false);
      }else {
        const nextPage = page + 1;
        setPage(nextPage);
        setCachedPage(nextPage);
      }

      //projectデータ拡張
      const enrichedProjects = enrichedProject(data, included);

      if (!signal?.aborted) {
        setProjects((prevProjects) => [...prevProjects, ...enrichedProjects]);
        setCachedProject((prevProjects) => [...prevProjects, ...enrichedProjects]);
      }
      console.log("setProjects");
    }catch(error: any) {
      setError(error.message);
    }finally {
      setLoading(false);
    }
  };

  //projectデータ拡張関数
  const enrichedProject =  (data: Project[], included: IncludedItem[]): EnrichedProject[] =>{

    // ユーザー情報をマッピング
    const userMap: Record<string, User> = included.reduce<Record<string, User>>((map, item) => {
      if (item.type === "user") {
        map[item.id] = item as User;
      }
      return map;
    }, {});

    //audioFile情報をマッピング
    const audioMap: Record<string, string> = included.reduce<Record<string, string>>((map, item) => {
      if (item.type === "audio_file") {
        const audioFile = item as AudioFile;
        map[audioFile.id] = audioFile.attributes.file_path;
      }
      return map;

    }, {});

    // ローカルストレージからユーザーを取得して isOwner を計算
    const storedUser = localStorage.getItem("authenticatedUser");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    // projects を拡張
    return data.map((project) => {
      const user = userMap[project.relationships.user.data.id];
      const audioFileId = project.relationships.audio_file?.data?.id;
      const audioFilePath = audioFileId ? audioMap[audioFileId] : undefined;

      // isOwner を計算
      const isOwner = parsedUser?.id === user.id;
      return { ...project, user, audioFilePath, isOwner };
    });
  }


  //スクロール保持
  useEffect(() => {
    if ( mode === "detail") return;
    const handleScroll = throttle(() => {
      scrollPosition.current = window.scrollY;
    }, 200); // スクロール毎に呼ばれるが実行は200ms間隔

    // スクロールイベント
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, []);


  //再生ボタン押下時処理
  const handlePlayClick = async (project: EnrichedProject) => {
    const { user, audioFilePath } = project;
    console.log("AudioControllerでのfilePath", audioFilePath, project.attributes.id);
    try {
      if (audioFilePath) {
        const audioData = await fetchAudioData(audioFilePath);
        setAudioData(audioData);
        setAudioUrl(audioFilePath);
        setAudioControllerVisible(true);
        setProjectForController(project);
        setUserForController(user);
      }
    }catch(e) {
      console.error("音声データが取得できませんでした");
    }
  };

  //AudioController閉じる処理
  const handleCloseClick = () => {
    setProjectForController(null);
    setUserForController(null);
    setAudioControllerVisible(false);
    setAudioUrl(null);
    setAudioData(null);
  };

  // 初期ロード中の表示
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mx: 2, my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return(
    <Box sx={{ pb : "56px" }}>
      {projects.length === 0 ?(
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h6" color="textSecondary">
            まだ投稿がありません。
          </Typography>
        </Box>
      ) : (
        <InfiniteScroll
          dataLength={projects.length}
          next={() => mode === "list" && loadProjects(page)}
          hasMore={mode === "list" && hasMore}
          loader={
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress />
            </Box>
          }
        >
        {projects.map((project) => (
            <ProjectCard
            mode={mode}
            key={project.attributes.id}
            onPlayClick={handlePlayClick}
            project={project}
            />
          ))}
        </InfiniteScroll>
      )}
      {isAudioControllerVisible && audioUrl && audioData &&(
        <AudioController
          onClose={handleCloseClick}
          project={projectForController}
          user={userForController}
          audioData={audioData}
        />
      )}
    </Box>
  );
}