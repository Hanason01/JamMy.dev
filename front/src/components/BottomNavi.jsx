"use client";

import { useState } from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';

export function BottomNavi() {
  const [value, setValue] = useState(0);

  return (
    <BottomNavigation
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
      }}
      sx={{
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
