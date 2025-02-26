"use client";
import { Project, User, EnrichedProject,} from "@sharedTypes/types";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import throttle from "lodash/throttle";
import { Box, Alert, CircularProgress, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ProjectCard } from "@Project/ProjectCard";
import { AudioController } from "@components/Project/AudioController"
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { useClientCacheContext } from "@context/useClientCacheContext";
import { useProjectList } from "@swr/useProjectSWR";
import { useSWRConfig } from "swr";
import { useRevalidateSWR } from "@utils/useRevalidateSWR";
import { PullToRefresh } from "@components/PullToRefresh";


export function ProjectIndexWrapper({}){

//SWR関連
  // 投稿一覧用
  const { projects, meta, hasMore, loadMore, isLoading, isError, isValidating, mutate, getKey } = useProjectList();
  // console.log("SWRのprojectsキャッシュ", projects);
  // const { cache } = useSWRConfig();
  // console.log("Indexのcache", cache);

  const { updateAllProjects } = useRevalidateSWR();
  // プル・トゥ・リフレッシュ処理
  const handleRefresh = async () => {
    if (projects.length > 0) {
      await updateAllProjects(projects[0].id);
    }
  };


  const [isAudioControllerVisible, setAudioControllerVisible] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  //オーディオコントローラーに使用
  const [projectForController, setProjectForController] = useState<Project | null>(null);
  const [userForController, setUserForController] = useState<User | null>(null);


  //フック
  const { fetchAudioData } = useFetchAudioData();

  //Context
  const { scrollPosition } = useClientCacheContext();


  // スクロール位置を復元
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, scrollPosition.current);
    }, 0); // DOM描画完了後
    setLoading(false);
  }, []);


  //スクロール保持
  useEffect(() => {
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


  if (isError) {
    return (
      <Box sx={{ mx: 2, my: 4 }}>
        <Alert severity="error">{isError}</Alert>
      </Box>
    );
  }

  //初期状態
  if (!projects) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return(
    <Box sx={{ pb : "56px" }}>
      <PullToRefresh onRefresh={handleRefresh} />

      { isLoading ? (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    ) : projects.length === 0 ?(
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h6" color="textSecondary">
            投稿がありません。
          </Typography>
        </Box>
      ) : (
        <InfiniteScroll
          dataLength={projects.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress />
            </Box>
          }
        >
          <Grid
          container spacing={2}
          direction="row"
          justifyContent="center"
            sx={{
              maxWidth: "1200px",
              margin: "0 auto",
            }}>
            {projects.map((project) => (
              <Grid key={project.attributes.id} {...{ xs: 12, md: 6 }} sx={{ px: 1, py:1 }}>
                <ProjectCard
                  mode="list"
                  category="projects"
                  onPlayClick={handlePlayClick}
                  project={project}
                  getKey={getKey}
                />
              </Grid>
            ))}
          </Grid>
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