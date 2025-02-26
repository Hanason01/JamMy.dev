"use client";

import { useState } from "react";
import Slider from "react-slick";
import { Typography, Box, Container, Stack, Button } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  {
    title: "音声を投稿してみる",
    description: "お題を作成し、短い音声を録音して投稿！仲間とコラボする最初のステップです",
    image: "/images/Post.gif",
  },
  {
    title: "応募する",
    description: "他のユーザーの投稿に音声を応募して、コラボリクエストします",
    image: "/images/Collaboration.gif",
  },
  {
    title: "コラボする",
    description: "応募された音声を最終調整し、合成ボタンを押すことでコラボができます",
    image: "/images/Collaboration_management.gif",
  },
];

export function Help() {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = slides.length;

  const handleBeforeChange = (oldIndex: number, newIndex: number) => {
    setActiveStep(newIndex);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + maxSteps) % maxSteps);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: handleBeforeChange,
  };

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        py: 6,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3} alignItems="center" textAlign="center">
          {/* タイトル */}
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            使い方ガイド
          </Typography>

          {/* スライダー */}
          <Box sx={{ width: "100%", position: "relative" }}>
            <Slider {...settings}>
              {slides.map((slide, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: "400px",
                  }}
                >
                  {/* 説明部分 */}
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {slide.title}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    {slide.description}
                  </Typography>

                  {/* 画像部分 */}
                  <Box
                    component="img"
                    src={slide.image}
                    alt={slide.title}
                    sx={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              ))}
            </Slider>
          </Box>

          {/* スライドナビゲーション */}
          <Stack direction="row" spacing={2}>
            <Button onClick={handleBack} sx={{ color: "primary.main" }}>
              <KeyboardArrowLeft />
            </Button>
            <Button onClick={handleNext} sx={{ color: "primary.main" }}>
              <KeyboardArrowRight />
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
