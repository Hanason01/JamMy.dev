"use client";
import { Project, User, InitialProjectData,Meta, EnrichedProject, AudioFile, IncludedItem } from "@sharedTypes/types";
import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import throttle from "lodash/throttle";
import { Box, Alert, CircularProgress, Typography } from "@mui/material";
import { ProjectCard } from "@Project/ProjectCard";
import { AudioController } from "@components/Project/AudioController"
import { useProjectIndexRequest } from "@services/project/useProjectIndexRequest";
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { useClientCacheContext } from "@context/useClientCacheContext";


export function ProjectWrapper({
  mode,
  initialProjectData,
  meta,
}:{
  mode: "list" | "detail";
  initialProjectData: InitialProjectData[];
  meta?: Meta
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

  //Context
  const {
    cachedProject, setCachedProject,
    cachedPage, setCachedPage,
    cachedHasMore, setCachedHasMore,
    scrollPosition,
  } = useClientCacheContext();



  //リクエスト初期化
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // Showの場合
    if (mode === "detail") {
      if (!signal?.aborted) {
        const enrichedProjects = applyIsOwner(initialProjectData);
        setProjects(enrichedProjects);
        }
      setLoading(false);
    // Indexの場合
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
      }
    }

    return () => {
      controller.abort(); // 非同期処理を中断
      setProjects([]);
    }
  }, []);

  //ページネーションによる追加projectsロード
  const loadProjects = async (page: number, options?: { signal?: AbortSignal }) => {
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
      const enrichedProjects = applyIsOwner(initialProjectData);

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

  //isOwner追加関数
  const applyIsOwner=  (projects: InitialProjectData[]): EnrichedProject[] =>{
    // ローカルストレージからユーザーを取得して isOwner を計算
    const storedUser = localStorage.getItem("authenticatedUser");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    // 各projectsに割り振り
    return projects.map((project) => ({
      ...project,
      isOwner: parsedUser?.id === project.user.id,
    }));
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
            投稿がありません。
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
            projects={projects}
            setProjects={setProjects}
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