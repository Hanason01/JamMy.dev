"use client";

import { SetState } from "@sharedTypes/types";
import { useState, useEffect } from "react";
import { useVolumeControl } from "@audio/useVolumeControl";
// import { useReverbControl } from "@audio/useReverbControl";
import { Box, Slider, Typography, IconButton } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
// import BlurOnIcon from "@mui/icons-material/BlurOn";
// import BlurOffIcon from "@mui/icons-material/BlurOff";

export function AudioProcessor({
  mixGainNode,
  // reverbInputGainNode
  setSelectedVolume
} : {
  mixGainNode: GainNode | null;
  // reverbInputGainNode: GainNode | null;
  setSelectedVolume: SetState<number>;
}) {

  //Volume関係
  const { volume, updateVolume } = useVolumeControl({ mixGainNode });
  const [isMuted, setIsMuted] = useState<boolean>(false); // ミュート管理
  const [previousVolume, setPreviousVolume] = useState<number>(volume); // ミュート前の音量を保存

  // //Reverb関係
  // const { reverbLevel, updateReverbLevel } = useReverbControl({ reverbInputGainNode });
  // const [isReverbEnabled, setIsReverbEnabled] = useState<boolean>(false); // リバーブの有効/無効
  // const [previousReverbLevel, setPreviousReverbLevel] = useState<number>(reverbLevel); // オフ前のリバーブ値を保存

  //ミュート関数(Volume)
  const toggleMute = () => {
    if (isMuted) {
      updateVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      updateVolume(0);
    }
    setIsMuted(!isMuted);
  };

  // // リバーブトグル(Reverb)
  // const toggleReverb = () => {
  //   if (isReverbEnabled) {
  //     setPreviousReverbLevel(reverbLevel);
  //     updateReverbLevel(0);
  //   } else {
  //     updateReverbLevel(previousReverbLevel);
  //   }
  //   setIsReverbEnabled(!isReverbEnabled);
  // };

  // スライダーの変更時に音量を更新し、親コンポーネントに通知
  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    updateVolume(newVolume);
    setSelectedVolume(newVolume);
  };

  return(
    <Box sx={{ display: "flex" }}>
     {/* Volumeスライダー */}
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "150px",
        width: "60px",}}>
        <IconButton onClick={toggleMute} sx={{ mb:1, p:0 }}>
          {isMuted ? (
            <VolumeOffIcon sx={{ fontSize: "1.5rem", color: "gray" }} />
          ) : (
            <VolumeUpIcon sx={{ fontSize: "1.5rem", color: "secondary.main" }} />
          )}
        </IconButton>
        <Slider
          color="secondary"
          disabled={isMuted}
          orientation="vertical"
          value={volume}
          min={0}
          max={2} // 200% の音量
          step={0.01}
          onChange={handleVolumeChange}
          aria-labelledby="volume-slider"
          sx={{ height: "100px" }}
        />
        {/* 下部ラベル */}
        <Typography sx={{ mt: 1, fontSize: "0.875rem" }}>
          {Math.round(volume * 100)}%
        </Typography>
      </Box>
      {/* リバーブコントロール
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "150px",
          width: "45px",
        }}
      >
        <IconButton onClick={toggleReverb} sx={{ mb: 1, p: 0 }}>
          {isReverbEnabled ? (
            <BlurOnIcon sx={{ fontSize: "1.5rem", color: "secondary.main" }} />
          ) : (
            <BlurOffIcon sx={{ fontSize: "1.5rem", color: "gray" }} />
          )}
        </IconButton>
        <Slider
          color="secondary"
          disabled={!isReverbEnabled}
          orientation="vertical"
          value={reverbLevel}
          min={0}
          max={1}
          step={0.01}
          onChange={(_, newValue) => updateReverbLevel(newValue as number)}
          sx={{ height: "100px" }}
        />
        <Typography sx={{ mt: 1, fontSize: "0.875rem" }}>
          {Math.round(reverbLevel * 100)}%
        </Typography>
      </Box> */}
    </Box>
  );
};