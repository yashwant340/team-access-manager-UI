// src/components/DashboardLayout.tsx
import React from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Toolbar, Typography, Box, Button, Menu, MenuItem, Avatar, Chip } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const { Header, Content } = Layout;

const roleLabel = (platformRole?: string) => {
  switch (platformRole) {
    case 'PLATFORM_ADMIN':
      return 'Platform admin';
    case 'TEAM_ADMIN':
      return 'Team admin';
    default:
      return 'Member';
  }
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const role = roleLabel(user?.platformRole);

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
    
    <Layout className="page-shell">
      <Header className="app-header">
        <Toolbar className="app-header-toolbar" disableGutters>
          <Box className="app-brand">
            <Box className="app-brand-mark">AM</Box>
            <Box>
              <Typography className="app-brand-name">Access Management</Typography>
            </Box>
          </Box>

          <Box className="header-account">
            <Chip className="header-role-chip" label={role} size="small" />
            <Button
              className="header-profile-button"
              onClick={handleMenuOpen}
              aria-controls={anchorEl ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={anchorEl ? 'true' : undefined}
              startIcon={<Avatar className="header-avatar">{user?.username?.charAt(0).toUpperCase() || <AccountCircleIcon fontSize="small" />}</Avatar>}
            >
              <Box className="header-profile-copy"><Typography component="span">{user?.username || 'Account'}</Typography><Typography component="span">Account menu</Typography></Box>
            </Button>
            <Menu
              id="account-menu"
              className="header-account-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled className="header-menu-identity">Signed in as {user?.username || 'Account'}</MenuItem>
              <MenuItem onClick={handleLogout}>Log out</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Header>
    <Content className="app-content">{children}</Content>
    </Layout>
  );
};

export default DashboardLayout;



  
