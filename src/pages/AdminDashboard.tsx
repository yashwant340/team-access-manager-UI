import React from "react";
import { Tabs, Typography } from "antd";
import TeamAccessManager from "../components/TeamAccessManager";
import UserAccessManager from "../components/UserAccessManager";
import DashboardLayout from "./DashboardLayout";
import PendingRequest from "../components/PendingRequest";
import { Box } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";
import LoginRequest from "../components/LoginRequest";

const { Title } = Typography;
const { TabPane } = Tabs;

const AdminDashboard: React.FC = () => {
    const {user} = useAuth();
  return (
    <DashboardLayout>
        <Box p={3} display="flex" flexDirection="column" gap={3}>

            <Title level={2}>🔐 Access Control Dashboard</Title>
            <Tabs defaultActiveKey="team">
                
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
          
        </Box>
    </DashboardLayout>
    
  );
}

export default AdminDashboard;