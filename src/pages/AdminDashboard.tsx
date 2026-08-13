import React from "react";
import { Tabs, Typography } from "antd";
import TeamAccessManager from "../components/TeamAccessManager";
import UserAccessManager from "../components/UserAccessManager";
import DashboardLayout from "./DashboardLayout";
import PendingRequest from "../components/PendingRequest";
import { Box, Paper, Typography as MuiTypography } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";
import LoginRequest from "../components/LoginRequest";

const { Title } = Typography;
const { TabPane } = Tabs;

const AdminDashboard: React.FC = () => {
    const {user} = useAuth();
    const isPlatformAdmin = user?.platformRole === 'PLATFORM_ADMIN';
    const workspace = isPlatformAdmin
      ? {
          eyebrow: 'PLATFORM WORKSPACE',
          title: 'Platform Admin Dashboard',
          description: 'Manage teams, users, permissions, and review requests across the workspace.',
        }
      : {
          eyebrow: 'TEAM WORKSPACE',
          title: 'Team Admin Dashboard',
          description: 'Manage your team’s members, permissions, and access requests in one place.',
        };
  return (
    <DashboardLayout>
        <Box display="flex" flexDirection="column" gap={2.5}>
            <Paper className="app-surface dashboard-hero" sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <MuiTypography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '.13em' }}>{workspace.eyebrow}</MuiTypography>
              <Title level={2} style={{ margin: '4px 0 6px', color: '#182230' }}>{workspace.title}</Title>
              <MuiTypography color="text.secondary">{workspace.description}</MuiTypography>
            </Paper>
            <Paper className="app-surface workspace-panel" sx={{ p: { xs: 1, sm: 2 } }}>
            <Tabs className="workspace-tabs" defaultActiveKey="team" size="large">
                
                <TabPane tab="Team Access" key="team">
                    <TeamAccessManager  />
                </TabPane>
                    
                <TabPane tab="User Access" key="user">
                    <UserAccessManager />
                </TabPane>

                <TabPane tab = "Pending Request" key="request">
                    <PendingRequest />
                </TabPane>

                {user?.platformRole === 'PLATFORM_ADMIN' && 
                <TabPane tab = "Login Request" key="loginRequest">
                    <LoginRequest />
                </TabPane>
                }

            </Tabs>
            </Paper>
          
        </Box>
    </DashboardLayout>
    
  );
}

export default AdminDashboard;
