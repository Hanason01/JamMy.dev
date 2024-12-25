"use client";

import { AudioBuffer,PostSettings } from "@sharedTypes/types";
import { useState } from "react";
import { Stepper, Step, StepLabel, Box, Typography } from "@mui/material";
import PostAddIcon from '@mui/icons-material/PostAdd';
import { PostProjectStep1 } from "@Project/post_project/PostProjectStep1";
import { PostProjectStep2 } from "@components/Project/post_project/PostProjectStep2";
// import { useRequireAuth } from "@context/useRequireAuth";

const steps = ["録音", "投稿"];

export function PostProjectStepper(){
  const [activeStep, setActiveStep] = useState<number>(0);
  const [audioBufferForPost, setAudioBufferForPost] = useState<AudioBuffer>(null);
  const [settingsForPost, setSettingsForPost] = useState<PostSettings>({
    tempo: 120,
    duration: 30,
  });
  // const isAuthenticated = useRequireAuth();

  //ステップ進行制御
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // if(isAuthenticated) {
    return (
      <Box sx={{m:1, p:1}}>
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
          setAudioBufferForPost={setAudioBufferForPost}
          setSettingsForPost={setSettingsForPost}
          activeStep={activeStep}/>}
          {activeStep === 1 &&
          <PostProjectStep2
          onBack={handleBack}
          audioBufferForPost={audioBufferForPost}
          settingsForPost={settingsForPost}
          activeStep={activeStep} />}
        </Box>
      </Box>
    );
  // }
};
