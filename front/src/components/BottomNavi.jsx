"use client";

import { useState } from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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
      <BottomNavigationAction icon={<RestoreIcon />}
        sx={{
          color: 'primary.contrastText',
          '&.Mui-selected': {
            color: 'secondary.main',
          },
        }} />
      <BottomNavigationAction icon={<FavoriteIcon />}
        sx={{
          color: 'primary.contrastText',
          '&.Mui-selected': {
            color: 'secondary.main',
          },
        }}/>
      <BottomNavigationAction icon={<LocationOnIcon />}
        sx={{
          color: 'primary.contrastText',
          '&.Mui-selected': {
            color: 'secondary.main',
          },
        }}/>
      <BottomNavigationAction icon={<LocationOnIcon />}
        sx={{
          color: 'primary.contrastText',
          '&.Mui-selected': {
            color: 'secondary.main',
          },
        }}/>
    </BottomNavigation>
  );
}
