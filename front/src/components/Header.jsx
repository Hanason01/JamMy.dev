'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/useAuthContext';
import { useLogoutRequest } from '../hooks/services/user/useLogoutRequest';
import { AppBar, Box, Toolbar, Typography, Avatar, Menu, MenuItem } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';


export function Header() {
  const { isAuthenticated, authenticatedUser, handleAuthError } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [localUser, setLocalUser] = useState(null);

  // ローカルストレージからユーザー情報を取得（リロード対策）
  useEffect(() => {
    const storedUser = localStorage.getItem('authenticatedUser');
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    }
  }, []);


  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //ログイン処理
  const handleLogin = ()=>{
    //認証状態をfalseにしshowAuthModalをtrueに
    handleAuthError();
    handleClose();
  }

  //ログアウト処理
  const { logout } = useLogoutRequest();
  const handleLogout = async () => {
    try {
      await logout();
      setLocalUser(null);
      handleClose();
    } catch (error) {
      window.alert("ログアウトに失敗しました")
      console.error("ログアウト処理に失敗しました");
    }
  };

  //アバター情報の選定
  const avatarSrc =
    isAuthenticated && authenticatedUser?.data?.attributes?.image
      ? authenticatedUser.data.attributes.image
      : localUser?.data?.attributes?.image;

  const avatarAlt =
    isAuthenticated && authenticatedUser?.data?.attributes?.nickname
      ? authenticatedUser.data.attributes?.nickname
      : localUser?.data?.attributes?.nickname || 'User';

  return (
    <Box sx={{
      flexGrow: 1,
      height: '64px' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            JamMy
          </Typography>
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {avatarSrc ? (
                  <Avatar src={avatarSrc} alt={avatarAlt} />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {isAuthenticated || localUser ? (
                  <div>
                    <MenuItem onClick={handleClose}>マイページ</MenuItem>
                    <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
                  </div>
                ) : (
                  <MenuItem onClick={handleLogin}>ログイン</MenuItem>
                )}
              </Menu>
            </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
