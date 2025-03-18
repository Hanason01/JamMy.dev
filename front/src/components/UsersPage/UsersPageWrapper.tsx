"use client";

import { Project, User, EnrichedProject, AudioBuffer} from "@sharedTypes/types";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import throttle from "lodash/throttle";
import { Box, Alert, Tabs, Tab, Typography, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import PostAddIcon from "@mui/icons-material/PostAdd";
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { AudioController } from "@components/Project/AudioController"
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { useClientCacheContext } from "@context/useClientCacheContext";
import { ProjectCard } from "@Project/ProjectCard";
import { UserProfile } from "@UsersPage/UserProfile";
import { useOtherUserProjects } from "@swr/useOtherUsersProjectsSWR";
import { useRevalidateSWR } from "@utils/useRevalidateSWR";
import { PullToRefresh } from "@components/PullToRefresh";

export function UsersPageWrapper() {
  // Params
  const { userId } = useParams<Record<string, string>>();

  // SWR関連
  const [tab, setTab] = useState<"user_projects" | "user_collaborated">("user_projects");
  const { projects, hasMore, loadMore, isLoading, isValidating,  isError, mutate, getKey } = useOtherUserProjects(userId, tab);
  const { updateOtherUserProjects, updateOtherUserTab } = useRevalidateSWR();
  const handleRefresh = async () => {
    if (projects.length > 0) {
      await updateOtherUserProjects(projects[0].id);
    }
  };

  //状態管理
  const [isAudioControllerVisible, setAudioControllerVisible] = useState<boolean>(false);
  const [audioData, setAudioData] = useState<AudioBuffer>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [projectForController, setProjectForController] = useState<Project | null>(null);
  const [userForController, setUserForController] = useState<User | null>(null);
  const [audioSessionKey, setAudioSessionKey] = useState<string | null>(null);
  const globalAudioContextRef = useRef<AudioContext | null>(null);
  const [playFlagFromIndex, setPlayFlagFromIndex] = useState<boolean>(true); //初回再生用
  const [resetFlagFromIndex, setResetFlagFromIndex] = useState<boolean>(false);


   //フック
  const { fetchAudioData } = useFetchAudioData();

   //Context
  const { scrollPosition } = useClientCacheContext();

  // タブ切り替え時の処理
  const handleTabChange = (_: React.SyntheticEvent, newValue: "user_projects" | "user_collaborated") => {
    setTab(newValue);
  };

  // タブクリック時のフェッチ判定
  const handleTabClick = async (selectedTab: "user_projects" | "user_collaborated") => {
    if (tab === selectedTab && projects.length > 0) {
      await updateOtherUserTab(userId, selectedTab, projects[0].id); // すでに選択されているタブがクリックされた場合、フェッチ
    }
  };

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


  //AudioContextの初期化
  useEffect(()=> {
    globalAudioContextRef.current = new(window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 44100
    });
    return()=>{
      if(globalAudioContextRef.current){
        globalAudioContextRef.current.close().then(()=>{
          globalAudioContextRef.current =null;
        })
      }
      handleCloseClick();
    };
  },[]);


  //再生ボタン押下時処理
  const handlePlayClick = async (project: EnrichedProject) => {
    const { user, audioFilePath } = project;
    try {
      setResetFlagFromIndex(true); //再生中の場合は再生を停止
      setPlayFlagFromIndex(true); //再生中に再生ボタンを押下した場合は再生フラグを初期化する

      if (audioFilePath && globalAudioContextRef.current) {
        const audioArrayBuffer = await fetchAudioData(audioFilePath);
        const audioBufferData = await globalAudioContextRef.current.decodeAudioData(audioArrayBuffer);

        setAudioData(audioBufferData);
        setAudioControllerVisible(true);
        setProjectForController(project);
        setUserForController(user);
        setAudioSessionKey(`${project.id}-${Date.now()}`); //AudioControllerを再生ボタンごとに再生成する為の一意のキーを生成
      }
    }catch(e) {
      console.error("音声データが取得できませんでした");
    }
  };

  //AudioControllerを閉じる処理
  const handleCloseClick = async () => {
    setResetFlagFromIndex(true);
    setProjectForController(null);
    setUserForController(null);
    setAudioControllerVisible(false);
    setAudioData(null);
  };


  if (isError) {
    return (
      <Box sx={{ mx: 2, my: 4 }}>
        <Alert severity="error">{isError}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PullToRefresh onRefresh={handleRefresh} />
      {/* プロフィール欄 */}
      <UserProfile user_id = {userId}/>

      {/* タブ */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tabs
        value={tab}
        onChange={handleTabChange}
        scrollButtons={false}
        centered
        sx={{
          maxWidth: "100%",
          mb:3,
          height: 60,
          }}>
          <Tab
          label="投稿"
          value="user_projects"
          icon={<PostAddIcon /> }
          iconPosition="start"
          onClick={() => handleTabClick("user_projects")}
          sx={{ minWidth: "auto", px: 3 }}
          />
          <Tab
          label="コラボ"
          value="user_collaborated"
          icon={<Diversity3Icon />}
          iconPosition="start"
          onClick={() => handleTabClick("user_collaborated")}
          sx={{ minWidth: "auto", px: 3 }}
          />
        </Tabs>
      </Box>

      {/* 投稿一覧 */}
      <Box sx={{ pb : "56px" }}>
      {isValidating || isLoading ? (
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
        {isAudioControllerVisible && audioData && globalAudioContextRef.current &&(
          <AudioController
            key={audioSessionKey}
            onClose={handleCloseClick}
            project={projectForController}
            user={userForController}
            audioBuffer={audioData}
            audioContext ={globalAudioContextRef.current}
            playFlagFromIndex={playFlagFromIndex}
            setPlayFlagFromIndex={setPlayFlagFromIndex}
            resetFlagFromIndex={resetFlagFromIndex}
            setResetFlagFromIndex={setResetFlagFromIndex}
          />
        )}
      </Box>
    </Box>
  );
}
