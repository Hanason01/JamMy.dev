"use client";

import { useRouter } from "next/navigation";
import { Typography, ButtonBase, Box, Container, Stack } from "@mui/material";
import { useAuthContext } from "@context/useAuthContext";

export function Overview() {
  const router = useRouter();
  const { openAuthModal } = useAuthContext();

  const handleNavigateToProjects = () => {
    router.push("/projects");
  };

  const handleNavigateToAuth = () => {
    openAuthModal();
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
            誰でも、音でつながる<br></br>音声コラボアプリ
          </Typography>

          {/* 説明 */}
          <Typography variant="h6" color="text.primary">
            「お題」に合わせて、声や楽器の音を録音するだけ！
            <br />
            簡単に仲間と音を重ねて、楽しく作品を作れるサービスです。
          </Typography>

          {/* ボタンエリア */}
          <Stack direction="row" spacing={3}>
            <ButtonBase
              onClick={handleNavigateToProjects}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: "8px",
                backgroundColor: "secondary.dark",
                color: "secondary.contrastText",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "secondary.dark" },
              }}
            >
              投稿を見る
            </ButtonBase>

            <ButtonBase
              onClick={handleNavigateToAuth}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: "8px",
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "primary.dark" },
              }}
            >
              ログインする
            </ButtonBase>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
