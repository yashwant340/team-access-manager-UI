import React from 'react';
import { Box, Typography, Menu, MenuItem, IconButton } from '@mui/material';
import {AccountCircle as AccountCircleIcon} from '@mui/icons-material';

interface AccountCenterProps{
    username : string;
    onLogout : () => void;
}

export default function AccountCenter({ username, onLogout }:AccountCenterProps) {
const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
  setAnchorEl(event.currentTarget);
};

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout(); // Call the logout function passed as prop
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body1">{username}</Typography>
      <IconButton onClick={handleMenuOpen}>
        <AccountCircleIcon fontSize="large" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>{username}</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
}
