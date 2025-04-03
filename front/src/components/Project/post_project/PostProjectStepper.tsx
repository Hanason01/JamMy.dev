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
  const [audioBufferForProcessing, setAudioBufferForProcessing] = useState<AudioBuffer>(null);
  const [audioBufferForPost, setAudioBufferForPost] = useState<AudioBuffer>(null);
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
      setActiveStep(0);
      setReturnToStep1Mode("edit");
    } else {
      setActiveStep(0);
      setReturnToStep1Mode("record");
    }
  };

  return (
    <Box
    sx={{
      mx: "auto", mt:3, mb:9, p:1,
      width: "100%",
      maxWidth: "800px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", width: "100%"}}>
        <PostAddIcon color="primary" sx={{ fontSize: "2rem"}} />
        <Typography variant="h6" sx={{ color: "text.primary" }}>投稿画面</Typography>
      </Box>
      <Stepper activeStep={activeStep}
              sx={{
                justifyContent: "center",
                width: "60%",
                maxWidth: "600px",
                margin: "0 auto",
                my:3
              }}>
        {steps.map((label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        )))}
      </Stepper>

      <Box sx={{width:"100%",maxWidth: "100%",display: "flex", alignItems: "center", justifyContent: "center",}}>
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
