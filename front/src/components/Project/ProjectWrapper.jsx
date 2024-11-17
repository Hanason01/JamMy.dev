"use client";

import { useState, useEffect } from "react";
import { Box, Alert, CircularProgress, Typography } from "@mui/material";
import { ProjectCard } from "./ProjectCard";
import { AudioController } from "../../components/Project/AudioController";
import { projectIndexRequest } from "../../services/ProjectIndexRequest";

export function ProjectWrapper(){
  const [isAudioControllerVisible, setAudioControllerVisible] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [projects, setProjects] = useState([]);
  const [included, setIncluded] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // included 配列を使ってユーザー情報をマッピング
  const userMap = included.reduce((map, item) => {
    if (item.type === "user") {
      map[item.id] = item;
    }
    return map;
  }, {});

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

  const handlePlayClick = (project) => {
    const user = userMap[project.relationships.user.data.id];
    setCurrentProject(project); // 現在再生中のプロジェクトをセット
    setCurrentUser(user); // 現在再生中のユーザーをセット
    setAudioUrl(project.attributes.audioUrl); // オーディオURLをセット
    setAudioControllerVisible(true); // コントローラーを表示
  };
  const handleCloseClick = () => {
    setCurrentProject(null);
    setCurrentUser(null);
    setAudioControllerVisible(false);
    setAudioUrl(null);
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
      {isAudioControllerVisible && (
        <AudioController
          onClose={handleCloseClick}
          audioUrl={audioUrl}
          autoPlay={true}
          project={currentProject}
          user={currentUser}
        />
      )}
    </Box>
  );
}