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
import { CustomVerticalSlider } from "@Project/core_logic/CustomVerticalSlider";

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
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [previousVolume, setPreviousVolume] = useState<number>(volume);

  // //Reverb関係
  // const { reverbLevel, updateReverbLevel } = useReverbControl({ reverbInputGainNode });
  // const [isReverbEnabled, setIsReverbEnabled] = useState<boolean>(false); // リバーブの有効/無効
  // const [previousReverbLevel, setPreviousReverbLevel] = useState<number>(reverbLevel); // オフ前のリバーブ値を保存

  //ミュート関数(Volume)
  const toggleMute = () => {
    if (isMuted) {
      updateVolume(previousVolume);
      setSelectedVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      updateVolume(0);
      setSelectedVolume(0);
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
  const handleVolumeChange = (newValue: number) => {
    if (!isMuted) {
      updateVolume(newValue);
      setSelectedVolume(newValue);
    }
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
        <IconButton onClick={toggleMute} sx={{ mb:2, p:0 }}>
          {isMuted ? (
            <VolumeOffIcon sx={{ fontSize: "1.5rem", color: "gray" }} />
          ) : (
            <VolumeUpIcon sx={{ fontSize: "1.5rem", color: "secondary.main" }} />
          )}
        </IconButton>
        <CustomVerticalSlider
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          min={0}
          max={100}
          step={1}
          unit="%"
          disabled={isMuted} // ミュート時は無効化
        />
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