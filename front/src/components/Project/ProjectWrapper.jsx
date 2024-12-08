"use client";

import { useState, useEffect } from "react";
import { Box, Alert, CircularProgress, Typography } from "@mui/material";
import { ProjectCard } from "./ProjectCard";
import { AudioController } from "../../components/Project/AudioController";
import { projectIndexRequest } from "../../hooks/services/project/ProjectIndexRequest";
import { useFetchAudioData } from "../../hooks/audio/useFetchAudioData";


export function ProjectWrapper(){
  const [isAudioControllerVisible, setAudioControllerVisible] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [included, setIncluded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //オーディオコントローラーに使用
  const [projectForController, setProjectForController] = useState(null);
  const [userForController, setUserForController] = useState(null);

  const { fetchAudioData } = useFetchAudioData();
  // included 配列を使ってユーザー情報をマッピング
  const userMap = included.reduce((map, item) => {
    if (item.type === "user") {
      map[item.id] = item;
    }
    return map;
  }, {});

  //audioFile情報をマッピング
  const audioMap = included.reduce((map, item) => {
    if (item.type === "audio_file") {
      map[item.id] = item.attributes.file_path;
    }
    return map;
  }, {});

  //リクエスト初期化
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data, included } = await projectIndexRequest();
        setProjects(data);
        setIncluded(included);
      }catch(error) {
        setError(error.message);
      }finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  //再生ボタン押下時処理
  const handlePlayClick = async (project) => {
    const user = userMap[project.relationships.user.data.id];
    const audioFileId = project.relationships.audio_file?.data?.id;
    const audioFilePath = audioFileId ? audioMap[audioFileId] : null;
    try {
      const audioData = await fetchAudioData(audioFilePath);
      setAudioData(audioData);
      setAudioUrl(audioFilePath);
      setAudioControllerVisible(true);
      setProjectForController(project);
      setUserForController(user);
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
          const user = userMap[project.relationships.user.data.id];
          return(
            <ProjectCard
            key={project.attributes.id}
            onPlayClick={handlePlayClick}
            project={project}
            user={user}
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