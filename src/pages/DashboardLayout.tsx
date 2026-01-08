// src/components/DashboardLayout.tsx
import React from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const { Header, Content } = Layout;

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();            // Clear token and user state
    navigate('/login');  // Redirect to login page
  };

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);


  return (
    
    <Layout>
       <Header
        style={{
          background: '#001529',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
        }}
      >
    <AppBar position="static" style={{background: '#001529'}}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Dashboard - {user?.platformRole === 'PLATFORM_ADMIN'? 'Platform Admin' : 'Team Admin'}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="contained" color="info" onClick={handleLogout}>
            Logout
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography>{user?.username || 'no user'}</Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircleIcon fontSize="large" />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>Username : {user?.username || 'no user'}</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
    </Header>
    <Content style={{ padding: '24px' }}>{children}</Content>
    </Layout>
  );
};

export default DashboardLayout;



  
