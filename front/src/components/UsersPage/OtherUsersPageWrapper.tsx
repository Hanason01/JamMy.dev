"use client";

import { Project, User, EnrichedProject,} from "@sharedTypes/types";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import throttle from "lodash/throttle";
import { Box, Alert, Tabs, Tab, Typography, CircularProgress } from "@mui/material";
import PostAddIcon from "@mui/icons-material/PostAdd";
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { AudioController } from "@components/Project/AudioController"
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { useClientCacheContext } from "@context/useClientCacheContext";
import { ProjectCard } from "@Project/ProjectCard";
import { UserProfile } from "@UsersPage/UserProfile";
import { useOtherUserProjects } from "@swr/useOtherUsersProjectsSWR";
import { useSWRConfig } from "swr";

export function OtherUsersPageWrapper() {
  // Params
  const { userId } = useParams<Record<string, string>>();

  // SWR関連
  const [tab, setTab] = useState<"user_projects" | "user_collaborated">("user_projects");
  const { projects, hasMore, loadMore, isLoading, isValidating,  isError, mutate, getKey } = useOtherUserProjects(userId, tab);

  //状態管理
  const [isAudioControllerVisible, setAudioControllerVisible] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [projectForController, setProjectForController] = useState<Project | null>(null);
  const [userForController, setUserForController] = useState<User | null>(null);


   //フック
  const { fetchAudioData } = useFetchAudioData();

   //Context
  const { scrollPosition } = useClientCacheContext();

  // タブ切り替え時の処理
  const handleTabChange = (_: React.SyntheticEvent, newValue: "user_projects" | "user_collaborated") => {
    setTab(newValue);
    mutate(undefined, { revalidate: true }); // 遷移後のTabのリフレッシュ
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

  return (
    <Box>
      {/* プロフィール欄 */}
      <UserProfile user_id = {userId}/>

      {/* タブ */}
      <Tabs
      value={tab}
      onChange={handleTabChange}
      scrollButtons="auto"
      centered
      sx={{
        maxWidth: "100%",
        mb:3,
        height: 60,
        }}>
        <Tab label="投稿" value="user_projects" icon={<PostAddIcon /> } iconPosition="start" sx={{ minWidth: "auto", px: 3 }} />
        <Tab label="コラボ" value="user_collaborated" icon={<Diversity3Icon />} iconPosition="start" sx={{ minWidth: "auto", px: 3 }}/>
      </Tabs>

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
          {projects.map((project) => (
              <ProjectCard
              mode="list"
              category={tab}
              key={project.attributes.id}
              onPlayClick={handlePlayClick}
              project={project}
              getKey={getKey}
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
    </Box>
  );
}
