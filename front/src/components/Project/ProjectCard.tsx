"use client";

import { Project, User, EnrichedProject} from "@sharedTypes/types";
import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import { Paper, Box, Avatar, Button, IconButton, Typography } from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PeopleIcon from '@mui/icons-material/People';
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useProjectContext } from "@context/useProjectContext";
import { AudioController } from "@components/Project/AudioController";

export function ProjectCard({
  mode,
  project,
  onPlayClick,
} : {
  mode:"list" | "detail";
  project: EnrichedProject;
  onPlayClick: (project: EnrichedProject) => void;
}){
  const [expanded, setExpanded] = useState<boolean>(false); //概要展開
  const toggleExpanded = () => setExpanded(!expanded);
  //コラボレーション、応募管理ページへの遷移に利用
  const { setCurrentProject, setCurrentUser, setCurrentAudioFilePath, setCurrentProjectForShow } = useProjectContext();
  const router = useRouter();

  //プロジェクト概要の短縮
  const previewLength = 100;
  const previewText = project.attributes.description.slice(0, previewLength);
  const isDescriptionShort = project.attributes.description.length <= previewLength

  //プロジェクトの作成時間取得
  const createdAt = new Date(project.attributes.created_at);
  const formattedDate = formatDistanceToNow(createdAt, { addSuffix: true, locale: ja })


  //スクロール位置復元
  useEffect(() => {
    if(mode === "list"){
      const scrollPosition = localStorage.getItem("scrollPosition");
      if (scrollPosition) {
        window.scrollTo(0, Number(scrollPosition));
        localStorage.removeItem("scrollPosition");
      }
    }
  }, []);

  //応募ページ遷移
  const handleCollaborationRequest = () => {
    setCurrentProject(project);
    setCurrentUser(project.user);
    setCurrentAudioFilePath(project.audioFilePath || null);
    router.push(`/projects/${project.id}/collaboration`);
  };

  //応募管理ページ遷移
  const handleCollaborationManagementRequest = () => {
    setCurrentProject(project);
    setCurrentUser(project.user);
    setCurrentAudioFilePath(project.audioFilePath || null);
    router.push(`/projects/${project.id}/collaboration_management`);
  };

  //詳細ページへ遷移（スクロール位置保存）
  const handleProjectClick = () => {
    setCurrentProjectForShow(project);
    const scrollPosition = window.scrollY;
    localStorage.setItem("scrollPosition", String(scrollPosition));
    router.push(`/projects/${project.attributes.id}/project_show`);
  };

  return(
    <Paper
      elevation={3}
      sx={{
        border: '1px solid #ddd',
        borderRadius: 2,
        padding: 2,
        marginBottom: 2,
        position: 'relative',
        maxWidth: 600,
        backgroundColor: 'background.default',
        mx: 1,
        cursor: mode === "list" ? "pointer" : "default",
      }}
      onClick={mode === "list" ? handleProjectClick : undefined}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center'}}
        >
          <Avatar
            src={project.user.attributes.image || "/default-icon.png"}
            alt={project.user.attributes.nickname || project.user.attributes.username || undefined }
          />
          <Box sx={{ ml:2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1" component="span" color="textPrimary">
              {project.user.attributes.nickname || project.user.attributes.username }
            </Typography>
            <Typography variant="body2" color="textPrimary">
              {formattedDate}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" sx={{ mt: 1 }}>
          {project.attributes.title}
        </Typography>
        <Typography variant="body2">
          {expanded ? project.attributes.description : `${previewText}`}
        </Typography>
        {!isDescriptionShort &&(
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
            <Typography
              onClick={(e) => {
                e.stopPropagation(); // バブリング防止
                toggleExpanded();
              }}
              color="primary"
              variant="body2">
                {expanded ? "閉じる": "続きを読む"}
              </Typography>
            <IconButton
            onClick={(e)=> {
              e.stopPropagation(); // バブリング防止
              toggleExpanded();
            }}
            sx={{ color: 'primary.main', pl: 0 }}>
              {expanded ? <ExpandLessIcon/> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        )}
        {project.attributes.status === "open" && (
          project.isOwner ? (
            <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation(); // バブリング防止
              handleCollaborationManagementRequest();
            }}
              >応募管理</Button>
          ) : (
            <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation(); // バブリング防止
              handleCollaborationRequest();
            }}
            >応募する</Button>
          )
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            my: 1,
          }}
        >
          <PeopleIcon sx={{ color: 'text.secondary'}} />
          <Typography variant="body2" color="textSecondary">
            ユーザーB、ユーザーC他数名が参加（実装中）
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end'}}>
          <IconButton
          onClick={(e) => {
            e.stopPropagation(); // バブリング防止
            onPlayClick(project);
          }}
          sx={{
          color: 'primary.main',
          border: '2px solid',
          borderRadius: '14px',
          padding: 0,
          mr: 4,
          }}><PlayArrowIcon sx={{ fontSize: 70 }}/></IconButton>
        </Box>
      </Paper>
  );
};