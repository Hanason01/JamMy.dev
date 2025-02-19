"use client";

import { User } from "@sharedTypes/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@context/useAuthContext";
import { useLogoutRequest } from "@services/user/useLogoutRequest";
import Link from "next/link";
import { AppBar, Box, Toolbar, Typography, Avatar, Menu, MenuItem } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";


export function Header() {
  const { isAuthenticated, authenticatedUser, openAuthModal } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();


  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    openAuthModal();
    handleClose();
  };

  //利用規約・プライバシポリシー遷移
  const handleTerm = () => {
    handleClose();
    router.push("/terms");
  }

  const handlePrivacy = () => {
    handleClose();
    router.push("/privacy_policy");
  }

  //ログアウト処理
  const { logout } = useLogoutRequest();
  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
    } catch (error) {
      window.alert("ログアウトに失敗しました")
      console.error("ログアウト処理に失敗しました");
    }
  };

  return (
    <Box sx={{
      flexGrow: 1,
      height: "56px" }}>
      <AppBar position="fixed">
        <Toolbar sx={{ position: "relative" }}>
          <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            position:"absolute",
            left: "50%",
            transform: "translateX(-50%)",
            textDecoration: "none",
              color: "inherit",
            }}>
            JamMy
          </Typography>
            <Box sx={{ marginLeft: "auto" }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {authenticatedUser?.avatar_url ? (
                  <Avatar src={`/api/proxy-image?key=${encodeURIComponent(authenticatedUser.avatar_url)}`} alt={authenticatedUser?.nickname} />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                    onClick={handleTerm}
                  >
                    利用規約
                </MenuItem>
                <MenuItem
                    onClick={handlePrivacy}
                  >
                    プライバシーポリシー
                </MenuItem>
                <MenuItem
                  component="a"
                  href="https://docs.google.com/forms/d/e/1FAIpQLSf2F2t-i6hRg20p24Qq_en1MhfNxeXD2mDeqqpy2uGuYLDxog/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                >
                  お問い合わせ
                </MenuItem>
                {isAuthenticated || authenticatedUser ? (
                  <div>
                    <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
                  </div>
                ) : (
                  <MenuItem onClick={handleLogin}>ログイン</MenuItem>
                )}
              </Menu>
            </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
