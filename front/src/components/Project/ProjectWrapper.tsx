"use client";
import { Project, User, EnrichedProject, AudioFile } from "@sharedTypes/types";
import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "next/navigation";
import { Box, Alert, CircularProgress, Typography } from "@mui/material";
import { ProjectCard } from "@Project/ProjectCard";
import { AudioController } from "@components/Project/AudioController";
import { projectIndexRequest } from "@services/project/ProjectIndexRequest";
import { useFetchAudioData } from "@audio/useFetchAudioData";


export function ProjectWrapper(){
  const [isAudioControllerVisible, setAudioControllerVisible] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<ArrayBuffer | null>(null);
  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //無限スクロール
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);


  //オーディオコントローラーに使用
  const [projectForController, setProjectForController] = useState<Project | null>(null);
  const [userForController, setUserForController] = useState<User | null>(null);

  const { fetchAudioData } = useFetchAudioData();
  console.log("Project IDs:", projects.map((project) => project.attributes.id));
  console.log("page", page);
  console.log("hasMore", hasMore);

  //リクエスト初期化
  useEffect(() => {
    console.log("ProjectWrapperのuseEffect:projects:", projects);

    const controller = new AbortController();
    const { signal } = controller;

    loadProjects(1, { signal });
    setLoading(false)

    return () => {
      controller.abort(); // 非同期処理を中断
      setProjects([]);
      console.log("ProjectWrapperのアンマウント処理", projects);
    }
  }, []);

  //プロジェクトデータロード
  const loadProjects = async (page: number, options?: { signal?: AbortSignal }) => {
    console.log("loadProjectsの発動");

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
      }else {
        setPage((prevPage) => prevPage + 1);
      }

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
    const enrichedProjects = data.map((project) => {
      const user = userMap[project.relationships.user.data.id];
      const audioFileId = project.relationships.audio_file?.data?.id;
      const audioFilePath = audioFileId ? audioMap[audioFileId] : undefined;

      // isOwner を計算
      const isOwner = parsedUser?.id === user.id;
      return { ...project, user, audioFilePath, isOwner };
    });


    if (!signal?.aborted) {
      setProjects((prevProjects) => [...prevProjects, ...enrichedProjects]);
    }
      console.log("setProjects");
    }catch(error: any) {
      setError(error.message);
    }finally {
      setLoading(false);
    }
  };


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
          next={() => loadProjects(page)}
          hasMore={hasMore}
          loader={
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress />
            </Box>
          }
        >
        {projects.map((project) => (
            <ProjectCard
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