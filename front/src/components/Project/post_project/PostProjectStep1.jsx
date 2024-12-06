"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, InputAdornment, Slider, Button, MenuItem, Switch, FormGroup, FormControlLabel, Divider } from "@mui/material";
import { RecordingCore } from "../core_logic/RecordingCore";
import { PostProjectProcessing } from "./PostProjectProcessing";

export function PostProjectStep1({onNext, setAudioBufferForPost, settingsForPostRef, activeStep}){
  const [recordingDuration, setRecordingDuration] = useState(30); //秒数
  const [speedSliderValue, setSpeedSliderValue] = useState(120); //速度
  const [countIn, setCountIn] = useState(0); //カウントイン
  const [metronomeOn, setMetronomeOn] = useState(false); //メトロノームON/OFF
  const clickSoundBufferRef = useRef(null); //クリック音の保存場所（初期化ロジックはhooks/useAudioPlayer/initメソッド内）
  const [hasRecorded, setHasRecorded] = useState(false);

  //RecordingCore→PostProjectProcessingへの受け渡し
  const [audioBufferForProcessing, setAudioBufferForProcessing] = useState(null);

  console.log("hasRecordedの状態",hasRecorded);
  console.log("audioBufferForProcessingの状態", audioBufferForProcessing);

  const preCounts = [0,1,2,3,4,5,6,7]

  //秒数セット
  const handleRecordingDurationChange = (event) => setRecordingDuration(event.target.value);
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
      duration: recordingDuration,
    }
    settingsForPostRef = settings; //Step2用の録音設定
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
        <TextField
          label="秒数"
          variant="standard"
          type="number"
          value={recordingDuration}
          onChange={handleRecordingDurationChange}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">秒</InputAdornment>
            }
          }}
          sx={{my:1, width: "20%"}}
          // {...register("second")}
          // error={!!errors.second}
          // helperText={errors.second?.message}
        />
        <Box sx={{display: "flex", alignItems: "center", my:1, width: "50%"}}>
          <Slider
            value={speedSliderValue}
            onChange={handleSpeedSliderChange}
            min={1}
            max={200}
            sx={{mr:2}}
            />
          <Typography sx={{width: "40px"}}>
            {speedSliderValue}
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
          <FormGroup sx={{my:1,width: "50%"}}>
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
            duration: recordingDuration,
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