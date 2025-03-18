"use client";
import { Project, User, InitialProjectData, EnrichedProject, AudioBuffer } from "@sharedTypes/types";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Box, Alert, CircularProgress, Typography } from "@mui/material";
import { ProjectCard } from "@Project/ProjectCard";
import { CommentCard } from "@Project/comment/CommentCard";
import { AudioController } from "@Project/AudioController"
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { applyIsOwnerToProjects } from "@utils/applyIsOwnerToProjects";
import { useProjectComments } from "@swr/useCommentSWR";
import { useShowProject } from "@swr/useShowProjectSWR";
import { CommentForm } from "@Project/comment/CommentForm";
import { useSWRConfig } from "swr";
import { useRevalidateSWR } from "@utils/useRevalidateSWR";
import { PullToRefresh } from "@components/PullToRefresh";


export function ProjectShowWrapper(){
  const { projectId } = useParams<Record<string, string>>();

  //SWR関連
  const {
    projects,
    isLoading: isProjectLoading,
    isError: isProjectError,
    mutate: mutateProject,
    isValidating : isShowValidating,
    getKey
  } = useShowProject(projectId);

  const {
    comments,
    meta,
    hasMore,
    loadMore,
    isLoading: isCommentsLoading,
    isError,
    isValidating: isCommentsValidating,
    mutate
  } = useProjectComments(projectId);
  const { updateProjectDetail } = useRevalidateSWR();

  // const { cache } = useSWRConfig();
  // console.log("Showのcache", cache);



  const [isAudioControllerVisible, setAudioControllerVisible] = useState<boolean>(false);
  const [audioData, setAudioData] = useState<AudioBuffer>(null);
  // console.log("projects追跡",projects);

  //オーディオコントローラーに使用
  const [projectForController, setProjectForController] = useState<Project | null>(null);
  const [userForController, setUserForController] = useState<User | null>(null);
  const [audioSessionKey, setAudioSessionKey] = useState<string | null>(null);
  const globalAudioContextRef = useRef<AudioContext | null>(null);
  const [playFlagFromIndex, setPlayFlagFromIndex] = useState<boolean>(true); //初回再生用
  const [resetFlagFromIndex, setResetFlagFromIndex] = useState<boolean>(false);


  //フック
  const { fetchAudioData } = useFetchAudioData();

  //context


  // コメントへの返信処理
  const handleReply = (commentId: string) => {
    // console.log(`返信先Id: ${commentId}`);
    // 返信ロジック実装予定
  };

  // コメントの削除処理
  const handleDelete = (commentId: string) => {
    // console.log(`削除するId: ${commentId}`);
    // 削除ロジック実装予定
  };


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

  //初期状態
  if (!projects) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return(
    <Box sx={{ mb: 15, maxWidth: "800px", mx: "auto", p: 2 }}>
      <PullToRefresh onRefresh={() => updateProjectDetail(projectId)} />

      {isProjectLoading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : projects && projects.length === 0 ?(
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h6" color="textSecondary">
            投稿がありません。
          </Typography>
        </Box>
      ) : (
      projects.map((project) => (
        <Box key={project.attributes.id} sx={{ width: "100%", display: "flex", justifyContent: "center"}}>
          <ProjectCard
          mode="detail"
          key={project.attributes.id}
          onPlayClick={handlePlayClick}
          project={project}
          getKey={getKey}
          />
        </Box>
        ))
      )}

      {/* コメント表示部分（無限スクロール対応） */}
      { isCommentsLoading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <InfiniteScroll
          dataLength={comments.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress />
            </Box>
          }
        >
        {comments.map((comment) => (
            <CommentCard
              key={comment.attributes.id}
              comment={comment}
              onReply={handleReply}
              projectId={projectId}
              project={projects[0]}
              getKey={getKey}
            />
          ))
        }
        </InfiniteScroll>
      )}




      {isAudioControllerVisible ? (
        audioData && globalAudioContextRef.current ?(
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
        ) : null
      ) : (
        <CommentForm
          projectId={projectId}
          getKey={getKey}
        />
      )}
    </Box>
  );
}