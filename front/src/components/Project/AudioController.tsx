"use client";

import { Project, User, AudioBuffer, SetState } from "@sharedTypes/types";
import { useEffect } from "react";
import { Box, Avatar, IconButton, Typography, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AudioPlayer } from "@Project/core_logic/AudioPlayer";


export function AudioController({
  onClose,
  project,
  user,
  audioBuffer,
  audioContext,
  playFlagFromIndex,
  setPlayFlagFromIndex,
  resetFlagFromIndex,
  setResetFlagFromIndex,
} : {
  onClose: () => void;
  project: Project | null;
  user: User | null;
  audioBuffer: AudioBuffer;
  audioContext: AudioContext | null;
  playFlagFromIndex: boolean;
  setPlayFlagFromIndex: SetState<boolean>;
  resetFlagFromIndex: boolean;
  setResetFlagFromIndex: SetState<boolean>;
}){

  //AudioControllerのスクロールを無効化
  useEffect(()=>{
    const disableScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    const controller = document.getElementById("audio-controller");

    if (controller) {
      controller.addEventListener("touchmove", disableScroll, { passive: false}); //iOSではpassive =trueなので無効化する
    }

    return() =>{
      if(controller){
        controller.removeEventListener("touchmove", disableScroll);
      }
    }
},[]);

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
      id= "audio-controller"
    >
      <IconButton
        onClick={() => {
          onClose();
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
      {audioBuffer && audioContext ? (
        <AudioPlayer
          id = {"Index"}
          audioBuffer={audioBuffer}
          audioContext={audioContext}
          playFlagFromIndex={playFlagFromIndex}
          setPlayFlagFromIndex={setPlayFlagFromIndex}
          resetFlagFromIndex={resetFlagFromIndex}
          setResetFlagFromIndex={setResetFlagFromIndex}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100px",
          }}
        >
          <CircularProgress
            size={64}
            sx={{
              color: "primary.main",
            }}
          />
        </Box>
        )}
    </Box>
  );
}