import  { useEffect, useState } from 'react';
import { Table, Button, Modal, Typography, message } from 'antd';
import axios from '../api/axiosInstance';
import type { TeamDTO, UserDTO } from '../types/dto';
import TeamFeatureAccess from './TeamFeatureAccess';

const { Title } = Typography;

export default function TeamAccessManager() {
  const [teams, setTeams] = useState<TeamDTO[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [userModalOpen, setUserModalOpen] = useState(false);
const [selectedUsers, setSelectedUsers] = useState<UserDTO[]>([]);
const [selectedTeamName, setSelectedTeamName] = useState<string>('');


  useEffect(() => {
    axios
      .get<TeamDTO[]>('/v1/team-access-manager/team/getAll')
      .then((res) => setTeams(res.data))
      .catch(() => message.error('Failed to load teams'));
  }, []);

  const openPermissionsModal = (team: TeamDTO) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const openUserListModal = (team: TeamDTO) => {
  setSelectedUsers(team.userList || []);
  setSelectedTeamName(team.name);
  setUserModalOpen(true);
};

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTeam(null);
  };

  const columns = [
    {
      title: 'Team Name',
      dataIndex: 'name',
    },
    {
      title: 'Members',
      render: (_: any, team: TeamDTO) => (
        <Button type="link" onClick={() => openUserListModal(team)}>
            {team.userList?.length ?? 0}
        </Button>   
        ),
    },
    {
      title: 'Actions',
      render: (_: any, team: TeamDTO) => (
        <Button type="link" onClick={() => openPermissionsModal(team)}>
          Manage Permissions
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Team Access Control</Title>
      <Table rowKey="id" columns={columns} dataSource={teams} pagination={false} bordered />
      <Modal
  title={`Users in ${selectedTeamName}`}
  open={userModalOpen}
  onCancel={() => setUserModalOpen(false)}
  footer={null}
>
  <ul>
    {selectedUsers.map((user) => (
      <li key={user.id}>
        {user.name} ({user.email})
      </li>
    ))}
  </ul>
  <p style={{ marginTop: 16, fontStyle: 'italic', color: '#888' }}>
    To view or edit individual user access, please navigate to the <strong>User Access View</strong>.
  </p>
</Modal>

      <Modal
        title={`Permissions for ${selectedTeam?.name}`}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={700}
      >
        {selectedTeam && <TeamFeatureAccess teamId={selectedTeam.id} />}
      </Modal>
    </div>
  );
}
