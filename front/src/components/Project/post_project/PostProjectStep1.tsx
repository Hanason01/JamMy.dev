"use client";

import { AudioBuffer,PostSettings,SetState } from "@sharedTypes/types";
import { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, InputAdornment, Slider, Button, MenuItem, Switch, FormGroup, FormControlLabel, Divider } from "@mui/material";
import { CustomSlider } from "@components/Project/core_logic/CustomSlider";
import { RecordingCore } from "@Project/core_logic/RecordingCore";
import { PostProjectProcessing } from "@Project/post_project/PostProjectProcessing";


export function PostProjectStep1({onNext,
  returnToStep1Mode,
  setAudioBufferForPost,
  audioBufferForProcessing,
  setAudioBufferForProcessing,
  setSettingsForPost
}: {
  onNext: () => void;
  returnToStep1Mode: "edit" | "record";
  setAudioBufferForPost: SetState<AudioBuffer>;
  audioBufferForProcessing: AudioBuffer;
  setAudioBufferForProcessing: SetState<AudioBuffer>;
  setSettingsForPost: SetState<PostSettings>;
}){
  const [recordingDurationSliderValue, setRecordingDurationSliderValue] = useState<number>(30);
  const [speedSliderValue, setSpeedSliderValue] = useState<number>(120);
  const [countIn, setCountIn] = useState<number>(0);
  const [metronomeOn, setMetronomeOn] = useState<boolean>(false);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const [selectedVolume, setSelectedVolume] = useState<number>(50);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const preCounts = [0,1,2,3,4,5,6,7]


  //録音データの受け取りと受け渡し
  const handleRecordingComplete = (audioBuffer: AudioBuffer) =>{
    setAudioBufferForProcessing(audioBuffer);
    const settings: PostSettings = {
      tempo: speedSliderValue,
      duration: recordingDurationSliderValue,
    }
    setSettingsForPost(settings);
    setHasRecorded(true);
  };


  //被遷移制御（STEP2の編集or録音しなおし）
  useEffect(() => {
    if (returnToStep1Mode === "edit") {
      setHasRecorded(true);
    } else {
      setHasRecorded(false);
    }
  }, [returnToStep1Mode]);


  return(
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      maxWidth: "600px",
      p:2
      }}>
      <Box sx={{justifyContent: "flex-start",
        "& .MuiTypography-root": {
            fontSize: "1rem",
            color: "text.primary",
          },
          "& .MuiInputBase-root": {
            fontSize: "1rem",
            color: "text.primary",
          },
      }}>
        <Box sx={{display: "flex", alignItems: "center", my:1, width: "80%"}}>
          <CustomSlider
            value={recordingDurationSliderValue}
            onChange={setRecordingDurationSliderValue}
            min={1}
            max={60}
            unit="秒"
            disabled={isRecording}
          />
        </Box>
        <Box sx={{display: "flex", alignItems: "center", my:1, width: "80%"}}>
          <CustomSlider
            value={speedSliderValue}
            onChange={setSpeedSliderValue}
            min={40}
            max={200}
            unit="BPM"
            disabled={isRecording}
          />
        </Box>
        <TextField
          fullWidth
          variant="standard"
          type="number"
          select
          label="カウントイン"
          value={countIn}
          onChange={(e) => setCountIn(parseInt(e.target.value, 10))}
          sx={{my:1, width: "30%"}}
          >
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
                fontSize: "1rem",
                color: "text.primary",
              },
            }} />
          </FormGroup>
      </Box>

      <Divider sx={{my: 3}} />
      <Box sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}>
        {hasRecorded ? (
          <PostProjectProcessing
          mode = "with-effects"
          audioBufferForProcessing={audioBufferForProcessing} setHasRecorded={setHasRecorded}
          setAudioBufferForProcessing={setAudioBufferForProcessing}
          setAudioBufferForPost={setAudioBufferForPost}
          onNext = {onNext}
          returnToStep1Mode={returnToStep1Mode}
          selectedVolume ={selectedVolume}
          setSelectedVolume={setSelectedVolume}
          />
        ) : (
          <RecordingCore
          onRecordingComplete={handleRecordingComplete}
          settings={{
            tempo: speedSliderValue,
            countIn: countIn,
            duration: recordingDurationSliderValue,
            metronomeOn: metronomeOn,
          }}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          />
        )}
      </Box>
    </Box>
  );
};