import React, { useState } from "react";
import { Tabs, Select, Typography, Divider } from "antd";
import TeamAccessManager from "../components/TeamAccessManager";
import UserAccessManager from "../components/UserAccessManager";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const AdminDashboard: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Simulated options - replace with real API calls
  

  const mockUsers = [
    { id: 101, name: "Alice Smith" },
    { id: 102, name: "John Doe" },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>🔐 Admin Access Control Dashboard</Title>

      <Tabs defaultActiveKey="team">
        <TabPane tab="Team Access" key="team">
            <TeamAccessManager  />
        </TabPane>

        <TabPane tab="User Access" key="user">
          <Divider orientation="left">Select a User</Divider>
          <Select
            placeholder="Select user"
            style={{ width: 300, marginBottom: 20 }}
            onChange={(value) => setSelectedUserId(value)}
            value={selectedUserId}
          >
            {mockUsers.map((user) => (
              <Option key={user.id} value={user.id}>
                {user.name}
              </Option>
            ))}
          </Select>

          <UserAccessManager></UserAccessManager>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default AdminDashboard;