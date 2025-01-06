"use client";
import { Project, User, EnrichedProject, AudioFile } from "@sharedTypes/types";
import { useState, useEffect } from "react";
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


  //オーディオコントローラーに使用
  const [projectForController, setProjectForController] = useState<Project | null>(null);
  const [userForController, setUserForController] = useState<User | null>(null);

  const { fetchAudioData } = useFetchAudioData();


  //リクエスト初期化
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data, included } = await projectIndexRequest();

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

        setProjects(enrichedProjects);
      }catch(error: any) {
        setError(error.message);
      }finally {
        setLoading(false);
      }
    };
    loadProjects();
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

  // ローディング中の表示
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
        projects.map((project) => {
          return(
            <ProjectCard
            key={project.attributes.id}
            onPlayClick={handlePlayClick}
            project={project}
            />
          );
        })
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