"use client";

import { AudioBuffer,PostSettings } from "@sharedTypes/types";
import { useState, useEffect } from "react";
import { Stepper, Step, StepLabel, Box, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { CollaborationStep1 } from "@Collaboration/CollaborationStep1";
import { CollaborationStep2 } from "@Collaboration/CollaborationStep2";
import { PlaybackProvider } from "@context/usePlayBackContext";
import { useProjectContext } from "@context/useProjectContext";

const steps = ["録音", "応募"];

export function CollaborationStepper(){
  const [activeStep, setActiveStep] = useState<number>(0);
  const [returnToStep1Mode, setReturnToStep1Mode,] = useState<"edit" | "record">("record");
  const [audioBufferForProcessing, setAudioBufferForProcessing] = useState<AudioBuffer>(null); //編集前音声の保持
  const [audioBufferForPost, setAudioBufferForPost] = useState<AudioBuffer>(null); //編集後音声の保持

  //応募先Project/User情報(Context)
  const { currentProject, setCurrentProject, currentUser, setCurrentUser,currentAudioFilePath, setCurrentAudioFilePath } = useProjectContext();

  // データ格納（リロード対策）
  useEffect(() => {
    const initializeData = () => {
        if (currentProject && currentUser && currentAudioFilePath) {
          // セッションストレージに保存
          sessionStorage.setItem("currentProject", JSON.stringify(currentProject));
          sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
          sessionStorage.setItem("currentAudioFilePath", currentAudioFilePath);
          console.log("Contextのデータをセッションストレージに保存しました");
        }
    };
    initializeData();

    return () => {
      // セッションストレージからデータを削除
      sessionStorage.removeItem("currentProject");
      sessionStorage.removeItem("currentUser");
      sessionStorage.removeItem("currentAudioFilePath");
      console.log("Contextのデータをセッションストレージから削除しました");
    };
  }, []);

  // データ復元（リロード対策）
  useEffect(() => {
    if (!currentProject || !currentUser || !currentAudioFilePath) {
      setCurrentProject(JSON.parse(sessionStorage.getItem("currentProject") || "null"));
      setCurrentUser(JSON.parse(sessionStorage.getItem("currentUser") || "null"));
      setCurrentAudioFilePath(sessionStorage.getItem("currentAudioFilePath") || null);
    }
  }, []);

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
      <PlaybackProvider>
        <Box sx={{m:1, p:1}}>
          <Box sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
            <UploadFileIcon color="primary" sx={{ fontSize: "2rem"}} />
            <Typography variant="h6" sx={{ color: "text.primary" }}>応募画面</Typography>
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
            <CollaborationStep1
            onNext={handleNext}
            returnToStep1Mode={returnToStep1Mode}
            setAudioBufferForPost={setAudioBufferForPost}
            audioBufferForProcessing={audioBufferForProcessing}
            setAudioBufferForProcessing={setAudioBufferForProcessing}
            />}
            {activeStep === 1 &&
            <CollaborationStep2
            onBack={handleBack}
            audioBufferForPost={audioBufferForPost}
            setAudioBufferForPost={setAudioBufferForPost}
            />}
          </Box>
        </Box>
      </PlaybackProvider>
    );
};
