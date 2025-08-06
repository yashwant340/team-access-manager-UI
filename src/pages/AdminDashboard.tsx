import React from "react";
import { Tabs, Typography } from "antd";
import TeamAccessManager from "../components/TeamAccessManager";
import UserAccessManager from "../components/UserAccessManager";

const { Title } = Typography;
const { TabPane } = Tabs;

const AdminDashboard: React.FC = () => {

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>🔐 Admin Access Control Dashboard</Title>

      <Tabs defaultActiveKey="team">
        <TabPane tab="Team Access" key="team">
            <TeamAccessManager  />
        </TabPane>

        <TabPane tab="User Access" key="user">

          <UserAccessManager></UserAccessManager>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default AdminDashboard;