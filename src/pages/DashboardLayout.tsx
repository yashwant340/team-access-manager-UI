// src/components/DashboardLayout.tsx
import React from 'react';
import { Layout, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const { Header, Content } = Layout;

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();            // Clear token and user state
    navigate('/login');  // Redirect to login page
  };

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
        <Typography.Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
          Access Manager — {user?.platformRole?.toUpperCase()}
        </Typography.Text>
        <Button type="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Header>
      <Content style={{ padding: '24px' }}>{children}</Content>
    </Layout>
  );
};

export default DashboardLayout;
