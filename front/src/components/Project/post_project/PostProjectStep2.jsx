"use client";

import { Box, Button, Typography } from "@mui/material";

export function PostProjectStep2({onBack, audioBufferForPost, setAudioBufferForPost}){
  console.log("audioBufferForPostの値（Step1の録音データ）",audioBufferForPost);
  return(
    <Box>
    <Typography>STEP2のテスト</Typography>
    <Button onClick={onBack} variant="primary">録音し直す</Button>
  </Box>

  );
};

//録音し直すが押された時にsetAudioBufferForPost(false)しないといけない。