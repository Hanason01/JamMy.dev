"use client";

import { useState } from "react";
import { Stepper, Step, StepLabel, Box, Typography } from "@mui/material";
import PostAddIcon from '@mui/icons-material/PostAdd';
import { PostProjectStep1 } from "./PostProjectStep1";
import { PostProjectStep2 } from "./PostProjectStep2";

const steps = ["録音", "投稿"];

export function PostProjectStepper(){
  const [activeStep, setActiveStep] = useState(0);

  //ステップ進行制御
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{m:2, p:2}}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", mb:5}}>
        <PostAddIcon color="primary" sx={{ fontSize: "3rem"}} />
        <Typography variant="h5" sx={{ color: "text.primary" }}>投稿画面</Typography>
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
        {activeStep === 0 && <PostProjectStep1 onNext={handleNext} />}
        {activeStep === 1 && <PostProjectStep2 onBack={handleBack} />}
      </Box>
    </Box>
  );
};