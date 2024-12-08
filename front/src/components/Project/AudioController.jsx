"use client";

import { useProjectIndexAudioPlayer } from "../../hooks/audio/useProjectIndexAudioPlayer";
import { useEffect } from "react";
import { Box, Avatar, IconButton, Typography, Slider } from "@mui/material";
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CloseIcon from '@mui/icons-material/Close';

export function AudioController({onClose, audioData, project, user }){
  const { isPlaying, currentTime, duration, play, pause, seek } = useProjectIndexAudioPlayer(audioData);

  useEffect(() => {
      play(); //初回レンダリング時のみ自動再生
  }, []);

  return(
    <Box
      sx={{
        position: "fixed",
        bottom: 56,
        left: 0,
        right: 0,
        padding: 2,
        zIndex: 1100,
        backgroundColor: "primary.transparent",
        backdropFilter: "blur(8px) saturate(100%)",
      }}
    >
      <IconButton
        onClick={() => {
         pause(); // 再生停止
         onClose(); // 親コンポーネントでコントローラーを閉じる
          }}
        sx={{
          position: "absolute",
          top: -10,
          right: 5,
          color: "primary.main",
          backgroundColor: "white",
          boxShadow: 1,
          "&:hover": {
            backgroundColor: "#f5f5f5",
          }
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box sx={{ display: "flex", alignItems: "center", width: "100%", position: "relative", mb: 2}}>
        <Avatar src={user.attributes.image || "/default-icon.png"}
                alt={user.attributes.nickname || user.attributes.username }
                sx={{ width: 25, height: 25 }} />
        <Typography variant="body2" component="span" color="textSecondary">
          { user.attributes.nickname || user.attributes.username }
        </Typography>
        <Typography variant="body1" component="span" color="textPrimary" sx={{position: "absolute", left: "50%", transform: "translateX(-50%)",
      whiteSpace: "nowrap", }} >
        { project.attributes.title }
        </Typography>
      </Box>
      <Slider
        value={currentTime}
        min={0} max={duration}
        onChange={(e,value) => seek(value)}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between"}}>
        <Typography color= "textSecondary" sx={{ width: "35px", textAlign: "right",}}>{Math.floor(currentTime)}秒</Typography>
        <Box display= "flex" justifyContent= "center">
          <IconButton sx={{ p: 0 }} onClick={isPlaying ? pause : play} >{isPlaying ? (
            <PauseCircleIcon
              sx={{ width: 60, height: 60, color: "primary.main" }}
            />
          ) : (
            <PlayCircleFilledIcon
              sx={{ width: 60, height: 60, color: "primary.main" }}
            />
          )}</IconButton>
        </Box>
        <Typography color= "textSecondary" sx={{ width: "40px", textAlign: "left",}}>-{Math.max(0, Math.floor(duration - currentTime))}秒</Typography>
      </Box>
    </Box>
  );
}