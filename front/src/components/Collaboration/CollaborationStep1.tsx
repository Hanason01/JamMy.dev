"use client";

import { AudioBuffer,PostSettings,SetState, Project, User } from "@sharedTypes/types";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, TextField, InputAdornment, Slider, Button, MenuItem, Switch, FormGroup, FormControlLabel, Divider, CircularProgress, Avatar } from "@mui/material";
import { RecordingCore } from "@Project/core_logic/RecordingCore";
import { PostProjectProcessing } from "@Project/post_project/PostProjectProcessing";
import { AudioPlayer } from "@Project/core_logic/AudioPlayer";
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { useProjectContext } from "@context/useProjectContext";

export function CollaborationStep1({
  onNext,
  returnToStep1Mode,
  setAudioBufferForPost,
  audioBufferForProcessing,
  setAudioBufferForProcessing,
}: {
  onNext: () => void;
  returnToStep1Mode: "edit" | "record";
  setAudioBufferForPost: SetState<AudioBuffer>;
  audioBufferForProcessing: AudioBuffer;
  setAudioBufferForProcessing: SetState<AudioBuffer>;
}){
  //応募先Project/User情報(Context)
  const { currentProject, currentUser, currentAudioFilePath } = useProjectContext();

  //状態変数
  const [recordingDurationSliderValue, setRecordingDurationSliderValue] = useState<number>(30);
  const [speedSliderValue, setSpeedSliderValue] = useState<number>(120);
  const [countIn, setCountIn] = useState<number>(0);
  const [metronomeOn, setMetronomeOn] = useState<boolean>(false);
  const [enablePostAudio, setEnablePostAudio] = useState<boolean>(true);
  const [enablePostAudioPreview, setEnablePostAudioPreview] = useState<boolean>(false);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const [selectedVolume, setSelectedVolume] = useState<number>(50);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const globalAudioContextRef = useRef<AudioContext | null>(null);
  const [audioData, setAudioData] = useState<AudioBuffer>(null);

  const router = useRouter();

  //AudioPlayer識別ID
  const playerIds = ["Post", "Collaboration", "Recording"];

  //カウントインセレクト用
  const preCounts = [0,1,2,3,4,5,6,7]

  //フック
  const { fetchAudioData } = useFetchAudioData();


  //初期化
  useEffect(() => {
    const initializeAudioContext = async () => {
      let project = currentProject;
      let audioFilePath = currentAudioFilePath;
      let user = currentUser;
      try {
        // リロードの場合セッションストレージから復元、状態変数へ保持
        if (!currentProject || !currentUser || !currentAudioFilePath) {
            project = JSON.parse(sessionStorage.getItem("currentProject") || "null")
            user = JSON.parse(sessionStorage.getItem("currentUser") || "null");
            audioFilePath = sessionStorage.getItem("currentAudioFilePath") || null
        }

        //初回アクセス時の保有チェック
        const authenticatedUser = JSON.parse(localStorage.getItem("authenticatedUser") || "null");
        if (user && user.id === String(authenticatedUser.id)) {
          router.push("/projects");
        }

        // DurationおよびTempoの初期化
        if (project){
          setRecordingDurationSliderValue(project.attributes.duration);
          setSpeedSliderValue(project.attributes.tempo);
        }

        // globalAudioContext の初期化
        globalAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 44100
        });

        // AudioBuffer の取得
        if (audioFilePath) {
          const audioArrayBuffer = await fetchAudioData(audioFilePath);
          const audioBufferData = await globalAudioContextRef.current.decodeAudioData(audioArrayBuffer);
          setAudioData(audioBufferData);
        }
        else{
          console.error("音声を正常に取得できませんでした");
        }
      } catch (error) {
        console.error("AudioContext の初期化に失敗しました", error);
      }
    };
    initializeAudioContext();

    return () => {
      if (audioData) {
        setAudioData(null);
      }
      if (globalAudioContextRef.current) {
        globalAudioContextRef.current.close().then(() => {
          globalAudioContextRef.current = null;
        });
      }
      setRecordingDurationSliderValue(30);
      setSpeedSliderValue(120);
    };
  }, []);


  //被遷移制御（STEP2の編集or録音しなおし）
  useEffect(() => {
    if (returnToStep1Mode === "edit") {
      setHasRecorded(true);
    } else {
      setHasRecorded(false);
    }
  }, [returnToStep1Mode]);

  //録音データの受け取りと受け渡し
  const handleRecordingComplete = (audioBuffer: AudioBuffer) =>{
    setAudioBufferForProcessing(audioBuffer);
    setHasRecorded(true);
    setEnablePostAudioPreview(true);
  };

  return(
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      maxWidth: "600px",
      p:2
      }}>
      <Box sx={{
        justifyContent: "flex-start",
        "& .MuiTypography-root": {
            fontSize: "1rem",
            color: "text.primary",
          },
          "& .MuiInputBase-root": {
            fontSize: "1rem",
            color: "text.primary",
          },
      }}>
        <Box sx={{display: "flex", flexDirection: "column", alignItems: "flex-start", my:1, width: "100%"}}>
          <TextField
            fullWidth
            variant="standard"
            type="number"
            select
            label="カウントイン"
            value={countIn}
            onChange={(e) => setCountIn(parseInt(e.target.value, 10))}
            sx={{my:1, width: "25%"}}
            >25
            {preCounts.map((count) => (
              <MenuItem key={count} value={count}>
                {count}
              </MenuItem>
            ))}
          </TextField>
          <FormGroup sx={{my:1,width: "60%"}}>
            <FormControlLabel required control={<Switch checked={metronomeOn} onChange={(e) => setMetronomeOn(e.target.checked)}/> }label="メトロノーム"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "0.9rem",
                color: "text.primary",
              },
            }} />
          </FormGroup>
          <FormGroup sx={{my:1,width: "80%"}}>
            <FormControlLabel required control={<Switch checked={enablePostAudio} onChange={(e) => setEnablePostAudio(e.target.checked)}/> }label="録音時に投稿音声を聴く"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "0.9rem",
                color: "text.primary",
              },
            }} />
          </FormGroup>
        </Box>

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%", position: "relative", my:2}}>
            <Avatar src={
                      currentUser?.attributes.avatar_url
                        ? `/api/proxy-image?key=${encodeURIComponent(currentUser.attributes.avatar_url)}`
                        : "/default-icon.png"
                    }
                    alt={currentUser?.attributes.nickname || currentUser?.attributes.username || undefined }
                    sx={{ width: 35, height: 35 }} />
            <Typography
            variant="body2"
            component="span"
            color="textSecondary"
            sx={{
              maxWidth: "60%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              ml: 1,
            }}>
              { currentUser?.attributes.nickname || currentUser?.attributes.username }
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
            { currentProject?.attributes.title }
            </Typography>
          </Box>

          {audioData && globalAudioContextRef.current ? (
            <AudioPlayer
              id = {playerIds[0]} //Post
              audioBuffer={audioData}
              audioContext={globalAudioContextRef.current}
              enablePostAudioPreview={enablePostAudioPreview}
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
      </Box>

      <Divider sx={{my:3}} />
      <Box sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}>
        {globalAudioContextRef.current ? (
          hasRecorded ? (
            <PostProjectProcessing
            id = {playerIds[1]} //Collaboration
            mode = "with-effects"
            audioBufferForProcessing={audioBufferForProcessing} setHasRecorded={setHasRecorded}
            setAudioBufferForProcessing={setAudioBufferForProcessing}
            setAudioBufferForPost={setAudioBufferForPost}
            onNext = {onNext}
            returnToStep1Mode={returnToStep1Mode}
            enablePostAudioPreview={enablePostAudioPreview}
            setEnablePostAudioPreview={setEnablePostAudioPreview}
            selectedVolume ={selectedVolume}
            setSelectedVolume={setSelectedVolume}
            />
          ) : (
            <RecordingCore
            id = {playerIds[2]} //Collaboration
            globalAudioContext={globalAudioContextRef.current}
            onRecordingComplete={handleRecordingComplete}
            settings={{
              tempo: speedSliderValue,
              countIn: countIn,
              duration: recordingDurationSliderValue,
              metronomeOn: metronomeOn,
            }}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            enablePostAudio={enablePostAudio}
            />
            )
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "150px",
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
    </Box>
  );
};