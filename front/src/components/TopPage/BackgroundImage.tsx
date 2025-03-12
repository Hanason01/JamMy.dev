"use client";

import Box from "@mui/material/Box";
import { keyframes } from "@mui/system";

const zoomAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
`;


export function BackgroundImage(){
  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        minHeight: "50vh",
        maxHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundImage: "url(/images/TopLogo_Stable.jpg)",
          backgroundSize: {
            xs: "185%",
            sm: "145%",
            md: "135%",
            lg: "120%",
            xl: "100%",
          },
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          animation: `${zoomAnimation} 35s infinite ease-in-out`,
        }}
      />
    </Box>
  );
}