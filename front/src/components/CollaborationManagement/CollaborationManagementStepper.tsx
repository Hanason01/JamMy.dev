"use client";

import { AudioBuffer,PostSettings, Collaboration } from "@sharedTypes/types";
import { useState, useEffect, useRef } from "react";
import { Stepper, Step, StepLabel, Box, Typography, CircularProgress } from "@mui/material";
import HandymanIcon from "@mui/icons-material/Handyman";
import { CollaborationManagementStep1 } from "@CollaborationManagement/CollaborationManagementStep1";
import { CollaborationManagementStep2 } from "@CollaborationManagement/CollaborationManagementStep2";
import { CollaborationManagementStep3 } from "@CollaborationManagement/CollaborationManagementStep3";
import { useProjectContext } from "@context/useProjectContext";
import { collaborationManagementIndexRequest } from "@services/project/collaboration_management/useCollaborationManagementIndexRequest";
import { PlaybackProvider } from "@context/usePlayBackContext";
import { useSettingAudioSession } from "@utils/useSettingAudioSession";


const steps = ["応募選択/編集", "音声合成", "保存"];

export function CollaborationManagementStepper(){
  const [activeStep, setActiveStep] = useState<number>(0);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const globalAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  //管理対象のProject/User情報(Context)
  const { currentProject, setCurrentProject, currentUser, setCurrentUser,currentAudioFilePath, setCurrentAudioFilePath } = useProjectContext();

  //フック
  const { settingAudioSession } = useSettingAudioSession();

  // データ格納（リロード対策）
  useEffect(() => {
    const initializeData = () => {
        if (currentProject && currentUser && currentAudioFilePath) {
          sessionStorage.setItem("currentProject", JSON.stringify(currentProject));
          sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
          sessionStorage.setItem("currentAudioFilePath", currentAudioFilePath);
        }
    };
    initializeData();

    return () => {
      sessionStorage.removeItem("currentProject");
      sessionStorage.removeItem("currentUser");
      sessionStorage.removeItem("currentAudioFilePath");
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

  //応募コレクションを取得
  useEffect(() => {
    if (!currentProject) return;
    const controller = new AbortController();
    const { signal } = controller;

    const loadCollaborations = async () => {
      if (signal?.aborted) {
        return;
      }

      try {
        const collaborationsData = await collaborationManagementIndexRequest(currentProject.attributes.id, signal);

        setCollaborations(collaborationsData);
      }catch(error: any) {
        console.error(error.message);
      }finally {
        setLoading(false);
      }
    };
    loadCollaborations();

    return () => {
      controller.abort();
    }
  }, [currentProject]);

  //AudioContextの初期化
  useEffect(() => {
    const initializeAudioContext = async () => {
      settingAudioSession();
      globalAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100
      });
    }
    initializeAudioContext();


    return () =>{
      if (globalAudioContextRef.current) {
        globalAudioContextRef.current.close().then(() => {
          globalAudioContextRef.current = null;
        });
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    }
  },[]);

  //ステップ進行制御
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <PlaybackProvider>
      <Box sx={{
          mx: "auto", mt:3, mb:9, p:1,
          width: "100%",
          maxWidth: "800px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          }}>
        <Box sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
          <HandymanIcon color="primary" sx={{ fontSize: "2rem"}} />
          <Typography variant="h6" sx={{ color: "text.primary" }}>応募管理</Typography>
        </Box>
        <Stepper activeStep={activeStep}
                sx={{
                  justifyContent: "center",
                  width: "90%",
                  margin: "0 auto",
                  maxWidth: "600px",
                  my:3
                }}>
          {steps.map((label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          )))}
        </Stepper>

      {!loading ? (
        <Box  sx={{width:"100%",maxWidth: "100%",display: "flex", alignItems: "center", justifyContent: "center",}}>
          {activeStep === 0 &&
          <CollaborationManagementStep1
          onNext={handleNext}
          collaborations = {collaborations}
          setCollaborations = {setCollaborations}
          globalAudioContextRef = {globalAudioContextRef.current}
          />}
          {activeStep === 1 &&
          <CollaborationManagementStep2
          onNext={handleNext}
          onBack={handleBack}
          globalAudioContextRef = {globalAudioContextRef.current}
          />}
          {activeStep === 2 &&
          <CollaborationManagementStep3
          onBack={handleBack}
          globalAudioContextRef = {globalAudioContextRef.current}
          />}
        </Box>
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
    </PlaybackProvider>
  );
};
