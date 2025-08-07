import React from "react";
import { Tabs, Typography } from "antd";
import TeamAccessManager from "../components/TeamAccessManager";
import UserAccessManager from "../components/UserAccessManager";
import DashboardLayout from "./DashboardLayout";

const { Title } = Typography;
const { TabPane } = Tabs;

const AdminDashboard: React.FC = () => {

  return (
    <DashboardLayout>
        <div className="flex justify-center">
            <div className="w-full max-w-6xl p-5">
                <Title level={2}>🔐 Admin Access Control Dashboard</Title>
                <Tabs defaultActiveKey="team">
                    <TabPane tab="Team Access" key="team">
                        <TeamAccessManager  />
                    </TabPane>

                    <TabPane tab="User Access" key="user">
                        <UserAccessManager />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    </DashboardLayout>
    
  );
}

export default AdminDashboard;