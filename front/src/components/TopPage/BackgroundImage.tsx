"use client";

import Box from "@mui/material/Box";
import { keyframes } from "@mui/system";

const zoomAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

export function BackgroundImage(){
  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        minHeight: "50vh",
        maxHeight: "80vh",
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
          backgroundImage: "url(/images/TopImage.jpg)",
          backgroundSize: {
            xs: "180%",
            sm: "170%",
            md: "150%",
            lg: "120%",
            xl: "110%",
          },
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          animation: `${zoomAnimation} 35s infinite ease-in-out`,
        }}
      />
        <Box
          sx={{
            position: "absolute",
            top: "calc(50% + (100% * 0.14))",
            left: {
              xs: "59%",
              sm: "59%",
              md: "60%",
              lg: "64%",
              xl: "65%",
            },
            width: "55%",
            height:{
              xs: "16%",
              sm: "16%",
              md: "15%",
              lg: "13%",
              xl: "12%",
            },
            transform: "translate(-50%, -50%)",
            backgroundSize: {
              xs: "65%",
              sm: "65%",
              md: "59%",
              lg: "45%",
              xl: "40%",
            },
            backgroundImage: "url(/images/TopLogo.jpg)",
            backgroundRepeat: "no-repeat",
            animation: `${fadeIn} 3s ease-in forwards`,
            borderRadius: "10px",
          }}
        />
    </Box>
  );
}