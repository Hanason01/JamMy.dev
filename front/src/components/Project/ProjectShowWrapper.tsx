"use client";
import { Project, User, InitialProjectData, EnrichedProject } from "@sharedTypes/types";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Box, Alert, CircularProgress, Typography } from "@mui/material";
import { ProjectCard } from "@Project/ProjectCard";
import { CommentCard } from "@Project/comment/CommentCard";
import { AudioController } from "@Project/AudioController"
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { applyIsOwnerToProjects } from "@utils/applyIsOwnerToProjects";
import { useProjectComments } from "@services/swr/useCommentSWR";
import { CommentForm } from "@Project/comment/CommentForm";


export function ProjectShowWrapper(){
  const { projectId } = useParams<Record<string, string>>();

  //SWR関連
  const { comments, meta, hasMore, loadMore, isLoading, isError,isValidating,  mutate } = useProjectComments(projectId);
  console.log("SWRが取得したComments", comments);

  const [isAudioControllerVisible, setAudioControllerVisible] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  // console.log("projects追跡",projects);

  //オーディオコントローラーに使用
  const [projectForController, setProjectForController] = useState<Project | null>(null);
  const [userForController, setUserForController] = useState<User | null>(null);


  //フック
  const { fetchAudioData } = useFetchAudioData();

  //context

  //初期化処理
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const projects: InitialProjectData[] = await res.json();
        const enrichedProjects = applyIsOwnerToProjects(projects);
        setProjects(enrichedProjects);
      } catch (err) {
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();

    return () => {
      setProjects([]);
    }
  }, [projectId]);

  // コメントへの返信処理
  const handleReply = (commentId: string) => {
    console.log(`返信先Id: ${commentId}`);
    // 返信ロジック実装予定
  };

  // コメントの削除処理
  const handleDelete = (commentId: string) => {
    console.log(`削除するId: ${commentId}`);
    // 削除ロジック実装予定
  };


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
    <Box sx={{ bottom: 112 }}>
      {projects.length === 0 ?(
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h6" color="textSecondary">
            投稿がありません。
          </Typography>
        </Box>
      ) : (
      projects.map((project) => (
          <ProjectCard
          mode="detail"
          key={project.attributes.id}
          onPlayClick={handlePlayClick}
          project={project}
          projects={projects}
          setProjects={setProjects}
          />
        ))
      )}

      {/* コメント表示部分（無限スクロール対応） */}
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
          />
        ))
      }
      </InfiniteScroll>



      {isAudioControllerVisible ? (
        audioUrl && audioData ?(
        <AudioController
          onClose={handleCloseClick}
          project={projectForController}
          user={userForController}
          audioData={audioData}
        />
        ) : null
      ) : (
        <CommentForm
          projectId={projectId}
        />
      )}
    </Box>
  );
}