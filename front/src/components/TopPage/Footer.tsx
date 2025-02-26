"use client";

import { Box, Container, Typography, Stack, Divider, ButtonBase } from "@mui/material";
import Link from "next/link";

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "background.default",
        padding: "16px 0",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          spacing={{ xs: 0, sm: 4 }}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          {/* 利用規約 */}
          <Link href="/terms" passHref>
            <ButtonBase sx={{ p: 1, borderRadius: "4px" }}>
              <Typography variant="body2" sx={{ color: "primary.main" }}>
                利用規約
              </Typography>
            </ButtonBase>
          </Link>

          {/* お問い合わせ（外部リンク） */}
          <ButtonBase sx={{ p: 1, borderRadius: "4px" }} component="a" target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSf2F2t-i6hRg20p24Qq_en1MhfNxeXD2mDeqqpy2uGuYLDxog/viewform">
            <Typography variant="body2" sx={{ color: "primary.main" }}>
              お問い合わせ
            </Typography>
          </ButtonBase>

          {/* プライバシーポリシー */}
          <Link href="/privacy_policy" passHref>
            <ButtonBase sx={{ p: 1, borderRadius: "4px" }}>
              <Typography variant="body2" sx={{ color: "primary.main" }}>
                プライバシーポリシー
              </Typography>
            </ButtonBase>
          </Link>
        </Stack>

        <Divider sx={{ borderColor: "divider", my: 2 }} />

        <Typography variant="body2" align="center" color="text.secondary">
          © 2025 Hanamu. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
