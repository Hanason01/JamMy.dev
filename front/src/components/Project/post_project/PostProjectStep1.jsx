"use client";

import { useState } from "react";
import { Box, Typography, TextField, InputAdornment, Slider, MenuItem, Switch, FormGroup, FormControlLabel, Divider } from "@mui/material";
import { RecordingCore } from "../core_logic/RecordingCore";
import { PostProjectProcessing } from "./PostProjectProcessing";

export function PostProjectStep1({ onNext }){
  const [sliderValue, setSliderValue] = useState(120);
  const [countIn, setCountIn] = useState(2);
  //RecordingCore→PostProjectProcessingへの受け渡し
  const [audioBufferForProcessing, setAudioBufferForProcessing] = useState(null);

  const preCounts = [0,1,2,3,4,5,6,7]

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleCountInChange = (event) => {
    setCountIn(event.target.value);
  };

  const handleRecordingComplete = (audioBuffer) =>{
    console.log("録音が完了しました:", audioBuffer);
    setAudioBufferForProcessing(audioBuffer);
  };

  return(
    <Box sx={{ maxWidth: "600px"}}>
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
          placeholder="1~60"
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
            value={sliderValue}
            onChange={handleSliderChange}
            min={1}
            max={200}
            sx={{mr:2}}
            />
          <Typography sx={{width: "40px"}}>
            {sliderValue}
          </Typography>
        </Box>
        <TextField
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
          </TextField>
          <FormGroup sx={{my:1,width: "50%"}}>
            <FormControlLabel required control={<Switch/>} label="メトロノーム"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "1rem", // 小さめのフォントサイズ
                color: "text.primary", // テーマの primary 色
              },
            }} />
          </FormGroup>
      </Box>

      <Divider />
      {audioBufferForProcessing ? (
        <PostProjectProcessing audioBufferForProcessing={audioBufferForProcessing} />
      ) : (
        <RecordingCore onRecordingComplete={handleRecordingComplete} />
      )}
    </Box>
  );
};