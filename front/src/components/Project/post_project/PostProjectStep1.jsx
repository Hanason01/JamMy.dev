"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, InputAdornment, Slider, Button, MenuItem, Switch, FormGroup, FormControlLabel, Divider } from "@mui/material";
import { RecordingCore } from "../core_logic/RecordingCore";
import { PostProjectProcessing } from "./PostProjectProcessing";

export function PostProjectStep1({onNext, setAudioBufferForPost, setSettingsForPost, activeStep}){
  const [recordingDurationSliderValue, setRecordingDurationSliderValue] = useState(30); //秒数
  const [speedSliderValue, setSpeedSliderValue] = useState(120); //速度
  const [countIn, setCountIn] = useState(0); //カウントイン
  const [metronomeOn, setMetronomeOn] = useState(false); //メトロノームON/OFF
  const clickSoundBufferRef = useRef(null); //クリック音の保存場所（初期化ロジックはhooks/useAudioPlayer/initメソッド内）
  const [hasRecorded, setHasRecorded] = useState(false);

  //RecordingCore→PostProjectProcessingへの受け渡し
  const [audioBufferForProcessing, setAudioBufferForProcessing] = useState(null);


  const preCounts = [0,1,2,3,4,5,6,7]

  //秒数セット
  const handleRecordingDurationSliderChange = (event, newValue) => {
    setRecordingDurationSliderValue(newValue);
  }
  //速度セット
  const handleSpeedSliderChange = (event, newValue) => setSpeedSliderValue(newValue);
  //カウントインセット
  // const handleCountInChange = (event) => setCountIn(event.target.value);
  //メトロノームセット
  const handleMetronomeToggle = (event) => setMetronomeOn(event.target.checked);

  //録音データの受け取りと受け渡し
  const handleRecordingComplete = (audioBuffer) =>{
    console.log("録音が完了しました:", audioBuffer);
    setAudioBufferForProcessing(audioBuffer); //Step1のプレビュー用
    setAudioBufferForPost(audioBuffer); //Step2のプレビュー用（Stepper）
    const settings = {
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
              onChange={handleRecordingDurationSliderChange}
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
              onChange={handleSpeedSliderChange}
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
          onChange={handleCountInChange}
          sx={{my:1, width: "20%"}}
          >
          {preCounts.map((count) => (
            <MenuItem key={count} value={count}>
              {count}
            </MenuItem>
          ))}
          </TextField> */}
          <FormGroup sx={{my:1,width: "60%"}}>
            <FormControlLabel required control={<Switch checked={metronomeOn} onChange={handleMetronomeToggle}/> }label="メトロノーム"
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
          clickSoundBuffer={clickSoundBufferRef.current}
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