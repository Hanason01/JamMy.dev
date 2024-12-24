"use client";

import Box from '@mui/material/Box';

export function BackgroundImage(){
  return (
    <Box
      sx={{
        backgroundImage: 'url(/images/TopImage.jpg)',
        backgroundSize: '180%',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
        height: '50vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
    </Box>
  );
}