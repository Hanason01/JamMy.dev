"use client";

import { Project, User } from "@sharedTypes/types";
import { useProjectIndexAudioPlayer } from "@audio/useProjectIndexAudioPlayer";
import { useEffect } from "react";
import { Box, Avatar, IconButton, Typography, Slider } from "@mui/material";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import CloseIcon from "@mui/icons-material/Close";


export function AudioController({
  onClose,
  audioData,
  project,
  user,
  audioElement
} : {
  onClose: () => void,
  audioData: ArrayBuffer | null,
  project: Project | null,
  user: User | null
  audioElement: HTMLAudioElement | null
}){
  const { isPlaying, isPlayingRef, currentTime, duration, play, pause, seek } = useProjectIndexAudioPlayer(audioElement);

  useEffect(() => {
    play(); //初回レンダリング時のみ自動再生
  }, [audioData]);

  //タブが非アクティブになった場合
  useEffect(() => {
    const handleVisibilityChange = () =>{
      if(document.hidden && isPlayingRef){ //タブを離れた場合かつ再生中のみ
        pause(); //停止ボタン処理
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return() =>{
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  },[])

  return(
    <Box
      sx={{
        position: "fixed",
        bottom: 56,
        left: 0,
        right: 0,
        padding: 2,
        zIndex: 1100,
        backgroundColor: "rgba(121, 134, 203, 0.1)",
        backdropFilter: "blur(14px) saturate(100%)",
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
      <Box >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%", position: "relative", mb: 2}}>
          <Avatar
                src={
                  user?.attributes.avatar_url
                    ? `/api/proxy-image?key=${encodeURIComponent(user.attributes.avatar_url)}`
                    : "/default-icon.png"
                }
                alt={user?.attributes.nickname || user?.attributes.username || undefined }
                sx={{ width: 35, height: 35 }} />
          <Typography
          component="span"
          color="textSecondary"
          sx={{
            maxWidth: "60%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            ml: 1,
          }}
          >
            { user?.attributes.nickname || user?.attributes.username }
          </Typography>
        </Box>
        <Box sx={{ mb:1}}>
          <Typography
            variant="body1"
            color="textPrimary"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "center",
              }} >
            { project?.attributes.title }
          </Typography>
        </Box>

      </Box>
      <Slider
        value={currentTime}
        min={0} max={duration}
        onChange={(e,value) => {
          if (typeof value === "number") {
            seek(value);
          }
        }}
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