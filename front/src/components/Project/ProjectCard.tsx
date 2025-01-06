"use client";

import { Project, User, EnrichedProject} from "@sharedTypes/types";
import { useState} from "react";
import { useRouter } from "next/navigation";
import { Paper, Box, Avatar, Button, IconButton, Typography } from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PeopleIcon from '@mui/icons-material/People';
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useProjectContext } from "@context/useProjectContext";

export function ProjectCard({
  project,
  onPlayClick,
} : {
  project: EnrichedProject;
  onPlayClick: (project: EnrichedProject) => void;
}){
  const [expanded, setExpanded] = useState<boolean>(false); //概要展開
  const toggleExpanded = () => setExpanded(!expanded);
  //コラボレーション、応募管理ページへの遷移に利用
  const { setCurrentProject, setCurrentUser, setCurrentAudioFilePath } = useProjectContext();
  const router = useRouter();

  //プロジェクト概要の短縮
  const previewLength = 100;
  const previewText = project.attributes.description.slice(0, previewLength);
  const isDescriptionShort = project.attributes.description.length <= previewLength

  //プロジェクトの作成時間取得
  const createdAt = new Date(project.attributes.created_at);
  const formattedDate = formatDistanceToNow(createdAt, { addSuffix: true, locale: ja })

  //応募ページ遷移
  const handleCollaborationRequest = () => {
    setCurrentProject(project);
    setCurrentUser(project.user);
    setCurrentAudioFilePath(project.audioFilePath || null);
    router.push(`/projects/${project.id}/collaboration`);
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
        mx: 1
      }}
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
              onClick={toggleExpanded}
              color="primary"
              variant="body2">
                {expanded ? "閉じる": "続きを読む"}
              </Typography>
            <IconButton onClick={toggleExpanded} sx={{ color: 'primary.main', pl: 0 }}>
              {expanded ? <ExpandLessIcon/> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        )}
        {!project.isOwner && (
          <Button variant="secondary" onClick={() => handleCollaborationRequest()}>応募する</Button>
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
          <IconButton onClick={() => onPlayClick(project)}
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