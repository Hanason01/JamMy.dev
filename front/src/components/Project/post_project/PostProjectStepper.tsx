"use client";

import { AudioBuffer,PostSettings } from "@sharedTypes/types";
import { useState } from "react";
import { Stepper, Step, StepLabel, Box, Typography } from "@mui/material";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { PostProjectStep1 } from "@Project/post_project/PostProjectStep1";
import { PostProjectStep2 } from "@components/Project/post_project/PostProjectStep2";

const steps = ["録音", "投稿"];

export function PostProjectStepper(){
  const [activeStep, setActiveStep] = useState<number>(0);
  const [returnToStep1Mode, setReturnToStep1Mode,] = useState<"edit" | "record">("record");
  const [audioBufferForProcessing, setAudioBufferForProcessing] = useState<AudioBuffer>(null); //編集前音声の保持
  const [audioBufferForPost, setAudioBufferForPost] = useState<AudioBuffer>(null); //編集後音声の保持
  const [settingsForPost, setSettingsForPost] = useState<PostSettings>({
    tempo: 120,
    duration: 30,
  });

  //ステップ進行制御
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = (mode: "edit" | "record") => {
    if (mode === "edit") {
      // 編集画面に戻す
      setActiveStep(0);
      setReturnToStep1Mode("edit");
    } else {
      // 録音画面に戻す
      setActiveStep(0);
      setReturnToStep1Mode("record");
    }
  };

  return (
    <Box sx={{mx:2, mt:3, mb:9, p:1}}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
        <PostAddIcon color="primary" sx={{ fontSize: "2rem"}} />
        <Typography variant="h6" sx={{ color: "text.primary" }}>投稿画面</Typography>
      </Box>
      <Stepper activeStep={activeStep}
              sx={{
                justifyContent: "center",
                width: "60%",
                margin: "0 auto",
                my:3
              }}>
        {steps.map((label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        )))}
      </Stepper>

      <Box>
        {activeStep === 0 &&
        <PostProjectStep1
        onNext={handleNext}
        returnToStep1Mode={returnToStep1Mode}
        setAudioBufferForPost={setAudioBufferForPost}
        audioBufferForProcessing={audioBufferForProcessing}
        setAudioBufferForProcessing={setAudioBufferForProcessing}
        setSettingsForPost={setSettingsForPost}
        />}
        {activeStep === 1 &&
        <PostProjectStep2
        onBack={handleBack}
        audioBufferForPost={audioBufferForPost}
        setAudioBufferForPost={setAudioBufferForPost}
        settingsForPost={settingsForPost}
        />}
      </Box>
    </Box>
  );
};
