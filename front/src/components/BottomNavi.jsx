"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { useCurrentRouteState} from '@/context/useCurrentRouteContext';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';

export function BottomNavi() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRoute, setCurrentRoute } = useCurrentRouteState();

  // `router.pathname` が変更されたら `currentRoute` を更新
  useEffect(() => {
    setCurrentRoute(pathname); // Contextに反映
  }, [pathname, setCurrentRoute]);

  const value = (() => {
    switch (currentRoute) {
      case "/projects":
        return 0;
      case "/post_project":
        return 1;
      case "/notification":
        return 2;
      case "/mypage":
        return 3;
      default:
        return 0;
    }
  })();

  const handleNavigationChange = (event, newValue) => {
    // 選択された値に基づきルートを設定
    let route = "/projects";
    switch (newValue) {
      case 0:
        route = "/projects";
        break;
      case 1:
        route = "/post_project";
        break;
      case 2:
        route = "/notification";
        break;
      case 3:
        route = "/mypage";
        break;
      default:
        route = "/projects";
    }

    setCurrentRoute(route); // Contextの状態を更新
    router.push(route); // ページ遷移
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleNavigationChange}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'primary.main',
      }}
    >
      <BottomNavigationAction icon={<HomeIcon />}
        sx={{
          color: 'primary.contrastText',
          '&.Mui-selected': {
            color: 'secondary.main',
          },
        }} />
      <BottomNavigationAction icon={<AddIcon />}
        sx={{
          color: 'primary.contrastText',
          '&.Mui-selected': {
            color: 'secondary.main',
          },
        }}/>
      <BottomNavigationAction icon={<NotificationsIcon />}
        sx={{
          color: 'primary.contrastText',
          '&.Mui-selected': {
            color: 'secondary.main',
          },
        }}/>
      <BottomNavigationAction icon={<PersonIcon />}
        sx={{
          color: 'primary.contrastText',
          '&.Mui-selected': {
            color: 'secondary.main',
          },
        }}/>
    </BottomNavigation>
  );
}
