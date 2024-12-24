"use client";

import { AudioBuffer,PostSettings,SetState } from "@sharedTypes/types";
import { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, InputAdornment, Slider, Button, MenuItem, Switch, FormGroup, FormControlLabel, Divider } from "@mui/material";
import { RecordingCore } from "@Project/core_logic/RecordingCore";
import { PostProjectProcessing } from "@Project/post_project/PostProjectProcessing";


export function PostProjectStep1({onNext, setAudioBufferForPost, setSettingsForPost, activeStep
}: {
  onNext: () => void;
  setAudioBufferForPost: SetState<AudioBuffer>;
  setSettingsForPost: SetState<PostSettings>;
  activeStep: number;
}){
  const [recordingDurationSliderValue, setRecordingDurationSliderValue] = useState<number>(30); //秒数
  const [speedSliderValue, setSpeedSliderValue] = useState<number>(120); //速度
  const [countIn, setCountIn] = useState<number>(0); //カウントイン
  const [metronomeOn, setMetronomeOn] = useState<boolean>(false); //メトロノームON/OFF
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);

  //RecordingCore→PostProjectProcessingへの受け渡し
  const [audioBufferForProcessing, setAudioBufferForProcessing] = useState<AudioBuffer>(null);

  //カウントインセレクト用
  const preCounts = [0,1,2,3,4,5,6,7]


  //録音データの受け取りと受け渡し
  const handleRecordingComplete = (audioBuffer: AudioBuffer) =>{
    console.log("録音が完了しました:", audioBuffer);
    setAudioBufferForProcessing(audioBuffer); //Step1のプレビュー用
    setAudioBufferForPost(audioBuffer); //Step2のプレビュー用（Stepper）
    const settings: PostSettings = {
      tempo: speedSliderValue,
      duration: recordingDurationSliderValue,
    }
    console.log("Step1が親へ渡すsettings", settings);
    setSettingsForPost(settings); //Step2用の録音設定
    setHasRecorded(true); //編集コンポーネントへ表示切替
  };

  //デバック用
  useEffect(() =>{
    console.log(`[${new Date().toISOString()}] PostProjectStep1がマウントされました`);
    return () => {
      console.log(`PostProjectStep1がアンマウントされました[${new Date().toISOString()}]`);
    };
  }, []);

  return(
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      maxWidth: "600px"
      }}>
      <Box sx={{justifyContent: "flex-start",
        "& .MuiTypography-root": {
            fontSize: "1rem", // 全体のフォントサイズ
            color: "text.primary", // テーマの文字色
          },
          "& .MuiInputBase-root": {
            fontSize: "1rem", // 入力フィールドの文字サイズ
            color: "text.primary", // 入力フィールドの文字色
          },
      }}>
        <Box sx={{display: "flex", alignItems: "center", my:1, width: "65%"}}>
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            <Slider
              value={recordingDurationSliderValue}
              onChange={(_, newValue) => setRecordingDurationSliderValue(newValue as number)}
              min={1}
              max={60}
              sx={{mr:2}}
              />
          </Box>
          <Typography  align="left" sx={{width: "60px"}}>
            {recordingDurationSliderValue} 秒
          </Typography>
        </Box>
        <Box sx={{display: "flex", alignItems: "center", my:1, width: "65%"}}>
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            <Slider
              value={speedSliderValue}
              onChange={(_, newValue) => setSpeedSliderValue(newValue as number)}
              min={1}
              max={200}
              sx={{mr:2}}
              />
          </Box>
          <Typography  align="left" sx={{width: "60px"}}>
            {speedSliderValue}BPM
          </Typography>
        </Box>
        {/* <TextField
          fullWidth
          variant="standard"
          type="number"
          select
          label="カウントイン"
          value={countIn}
          onChange={(e) => setCountIn(parseInt(e.target.value, 10))}
          sx={{my:1, width: "20%"}}
          >
          {preCounts.map((count) => (
            <MenuItem key={count} value={count}>
              {count}
            </MenuItem>
          ))}
          </TextField> */}
          <FormGroup sx={{my:1,width: "60%"}}>
            <FormControlLabel required control={<Switch checked={metronomeOn} onChange={(e) => setMetronomeOn(e.target.checked)}/> }label="メトロノーム"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "1rem", // 小さめのフォントサイズ
                color: "text.primary", // テーマの primary 色
              },
            }} />
          </FormGroup>
      </Box>

      <Divider />
      <Box sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}>
        {hasRecorded ? (
          <PostProjectProcessing
          audioBufferForProcessing={audioBufferForProcessing} setHasRecorded={setHasRecorded}
          setAudioBufferForProcessing={setAudioBufferForProcessing}
          activeStep={activeStep}
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
          />
        )}
        {hasRecorded && (
          <Box>
            <Button
            onClick={onNext}
            variant="primary"
            >
              投稿する
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};